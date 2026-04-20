import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Vehicule from '@/models/Vehicule';
import { schemaVehicule } from '@/lib/validation/vehicule.schemas';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// GET /api/vehicules — liste publique (clients) ou complète (gérant)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const statut = searchParams.get('statut');
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limite = Math.min(50, parseInt(searchParams.get('limite') ?? '12'));

    const filtre: Record<string, unknown> = {};
    if (statut) filtre.statut = statut;

    const total = await Vehicule.countDocuments(filtre);
    const vehicules = await Vehicule.find(filtre)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limite)
      .limit(limite)
      .lean();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { vehicules, total, page, pages: Math.ceil(total / limite) },
    });
  } catch (error) {
    console.error('[GET /api/vehicules]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/vehicules — créer un véhicule (gérant uniquement)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload || payload.role !== 'gerant') {
      return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json<ApiResponse>({ success: false, message: 'Corps invalide' }, { status: 400 });

    const validation = schemaVehicule.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Données invalides', errors: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    await connectDB();
    const vehicule = await Vehicule.create(validation.data);

    return NextResponse.json<ApiResponse>({ success: true, data: vehicule }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/vehicules]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
