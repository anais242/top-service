export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import { v2 as cloudinary } from 'cloudinary';
import type { ApiResponse } from '@/types';
import { logActivite } from '@/lib/activite';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadPermis(buffer: Buffer, userId: string, side: 'recto' | 'verso'): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `top-service/permis/${userId}`,
        public_id: side,
        overwrite: true,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload échoué'));
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

// POST /api/upload/permis — upload recto ou verso du permis de conduire
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload || payload.role !== 'client')
      return NextResponse.json<ApiResponse>({ success: false, message: 'Non autorisé' }, { status: 401 });

    const form = await req.formData();
    const fichier = form.get('photo') as File | null;
    const side = form.get('side') as string | null;

    if (!fichier) return NextResponse.json<ApiResponse>({ success: false, message: 'Fichier manquant' }, { status: 400 });
    if (side !== 'recto' && side !== 'verso') return NextResponse.json<ApiResponse>({ success: false, message: 'Side invalide (recto|verso)' }, { status: 400 });
    if (fichier.size > 5 * 1024 * 1024) return NextResponse.json<ApiResponse>({ success: false, message: 'Fichier trop lourd (max 5 Mo)' }, { status: 400 });

    const buffer = Buffer.from(await fichier.arrayBuffer());
    const url = await uploadPermis(buffer, payload.userId, side);

    await connectDB();
    const champ = side === 'recto' ? 'permisRecto' : 'permisVerso';
    const user = await User.findByIdAndUpdate(payload.userId, { [champ]: url }, { new: true }).select('permisRecto permisVerso').lean();

    logActivite({
      clientId: payload.userId,
      type:     'permis',
      action:   side === 'recto' ? 'permis_recto' : 'permis_verso',
      detail:   `Permis ${side} téléversé`,
    }).catch(() => {});

    return NextResponse.json<ApiResponse>({ success: true, data: { permisRecto: user?.permisRecto, permisVerso: user?.permisVerso } });
  } catch (error) {
    console.error('[POST /api/upload/permis]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
