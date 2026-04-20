export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Vehicule from '@/models/Vehicule';
import { uploadPhoto, supprimerPhoto } from '@/lib/cloudinary';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// POST /api/vehicules/[id]/photos — upload photo (gérant uniquement)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload || payload.role !== 'gerant')
      return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

    const formData = await req.formData();
    const fichier = formData.get('photo') as File | null;

    if (!fichier) return NextResponse.json<ApiResponse>({ success: false, message: 'Aucun fichier' }, { status: 400 });

    // Validation : image uniquement, max 5 Mo
    if (!fichier.type.startsWith('image/'))
      return NextResponse.json<ApiResponse>({ success: false, message: 'Format invalide (image uniquement)' }, { status: 400 });
    if (fichier.size > 5 * 1024 * 1024)
      return NextResponse.json<ApiResponse>({ success: false, message: 'Fichier trop lourd (max 5 Mo)' }, { status: 400 });

    await connectDB();
    const vehicule = await Vehicule.findById(params.id);
    if (!vehicule) return NextResponse.json<ApiResponse>({ success: false, message: 'Véhicule introuvable' }, { status: 404 });

    if (vehicule.photos.length >= 8)
      return NextResponse.json<ApiResponse>({ success: false, message: 'Maximum 8 photos par véhicule' }, { status: 400 });

    const buffer = Buffer.from(await fichier.arrayBuffer());
    const nomFichier = `${params.id}-${Date.now()}`;
    const url = await uploadPhoto(buffer, nomFichier);

    vehicule.photos.push(url);
    await vehicule.save();

    return NextResponse.json<ApiResponse>({ success: true, data: { url, photos: vehicule.photos } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/vehicules/[id]/photos]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/vehicules/[id]/photos — supprimer une photo (gérant uniquement)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload || payload.role !== 'gerant')
      return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

    const { url } = await req.json().catch(() => ({}));
    if (!url) return NextResponse.json<ApiResponse>({ success: false, message: 'URL manquante' }, { status: 400 });

    await connectDB();
    const vehicule = await Vehicule.findById(params.id);
    if (!vehicule) return NextResponse.json<ApiResponse>({ success: false, message: 'Véhicule introuvable' }, { status: 404 });

    vehicule.photos = vehicule.photos.filter((p) => p !== url);
    await vehicule.save();
    await supprimerPhoto(url);

    return NextResponse.json<ApiResponse>({ success: true, data: { photos: vehicule.photos } });
  } catch (error) {
    console.error('[DELETE /api/vehicules/[id]/photos]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
