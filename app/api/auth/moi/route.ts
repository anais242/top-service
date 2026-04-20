export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  if (!token) return NextResponse.json({ success: false }, { status: 401 });
  const payload = await verifierAccessToken(token);
  if (!payload) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json({ success: true, data: { nom: payload.nom, role: payload.role } });
}
