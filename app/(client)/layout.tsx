import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import NavbarClient from '@/app/components/NavbarClient';

export default async function LayoutClient({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_ACCESS)?.value;

  if (!token) redirect('/connexion?retour=/client/tableau-de-bord');

  const payload = await verifierAccessToken(token);
  if (!payload || payload.role !== 'client') redirect('/connexion');

  return (
    <>
      <NavbarClient nom={payload.nom} />
      {children}
    </>
  );
}
