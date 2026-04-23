export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  if (!token) return NextResponse.json({ success: false }, { status: 401 });
  const payload = await verifierAccessToken(token);
  if (!payload) return NextResponse.json({ success: false }, { status: 401 });

  await connectDB();
  const user = await User.findById(payload.userId).select('nom email telephone role permisRecto permisVerso').lean();
  if (!user) return NextResponse.json({ success: false }, { status: 401 });

  return NextResponse.json({
    success: true,
    data: { nom: user.nom, email: user.email, telephone: user.telephone, role: user.role, permisRecto: user.permisRecto ?? null, permisVerso: user.permisVerso ?? null },
  });
}
