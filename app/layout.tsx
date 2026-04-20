import type { Metadata } from 'next';
import './globals.css';
import BgAnime from './components/BgAnime';

export const metadata: Metadata = {
  title: 'Top Service — Location de voitures',
  description: 'Réservez votre véhicule en ligne facilement',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <BgAnime />
        <div className="page-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
