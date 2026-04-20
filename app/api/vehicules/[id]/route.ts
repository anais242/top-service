import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Vehicule from '@/models/Vehicule';
import { schemaVehicule } from '@/lib/validation/vehicule.schemas';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

function estGerant(req: NextRequest) {
  return verifierAccessToken(req.cookies.get(COOKIE_ACCESS)?.value ?? '').then(
    (p) => p?.role === 'gerant'
  );
}

// GET /api/vehicules/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const vehicule = await Vehicule.findById(params.id).lean();
    if (!vehicule) return NextResponse.json<ApiResponse>({ success: false, message: 'Véhicule introuvable' }, { status: 404 });
    return NextResponse.json<ApiResponse>({ success: true, data: vehicule });
  } catch (error) {
    console.error('[GET /api/vehicules/[id]]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/vehicules/[id] — gérant uniquement
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await estGerant(req)))
      return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json<ApiResponse>({ success: false, message: 'Corps invalide' }, { status: 400 });

    const validation = schemaVehicule.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Données invalides', errors: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    await connectDB();
    const vehicule = await Vehicule.findByIdAndUpdate(params.id, validation.data, { new: true, runValidators: true });
    if (!vehicule) return NextResponse.json<ApiResponse>({ success: false, message: 'Véhicule introuvable' }, { status: 404 });

    return NextResponse.json<ApiResponse>({ success: true, data: vehicule });
  } catch (error) {
    console.error('[PUT /api/vehicules/[id]]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/vehicules/[id] — gérant uniquement
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await estGerant(req)))
      return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

    await connectDB();
    const vehicule = await Vehicule.findByIdAndDelete(params.id);
    if (!vehicule) return NextResponse.json<ApiResponse>({ success: false, message: 'Véhicule introuvable' }, { status: 404 });

    return NextResponse.json<ApiResponse>({ success: true, message: 'Véhicule supprimé' });
  } catch (error) {
    console.error('[DELETE /api/vehicules/[id]]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
