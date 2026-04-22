import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import { verifierAccessToken } from '@/lib/auth/jwt';

export default async function LayoutBusiness({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;

  if (!payload || payload.role !== 'business') redirect('/connexion');

  return <>{children}</>;
}
