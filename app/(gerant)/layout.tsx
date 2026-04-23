import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import NavbarGerant from '@/app/components/NavbarGerant';
import SidebarGerant from '@/app/components/SidebarGerant';

export default async function LayoutGerant({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_ACCESS)?.value;

  if (!token) redirect('/connexion?retour=/gerant/tableau-de-bord');

  const payload = await verifierAccessToken(token);
  if (!payload || payload.role !== 'gerant') redirect('/connexion');

  return (
    <>
      <NavbarGerant nom={payload.nom} />
      <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 'calc(100vh - 60px)' }}>
        <SidebarGerant />
        <main style={{ flex: 1, minWidth: 0, padding: '0' }}>
          {children}
        </main>
      </div>
    </>
  );
}
