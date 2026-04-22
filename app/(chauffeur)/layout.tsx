import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import NavbarChauffeur from '@/app/components/NavbarChauffeur';

export default async function LayoutChauffeur({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_ACCESS)?.value;

  if (!token) redirect('/connexion?retour=/chauffeur/tableau-de-bord');

  const payload = await verifierAccessToken(token);
  if (!payload || payload.role !== 'chauffeur') redirect('/connexion');

  return (
    <>
      <NavbarChauffeur nom={payload.nom} />
      {children}
    </>
  );
}
