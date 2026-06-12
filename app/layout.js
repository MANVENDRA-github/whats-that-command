import { VT323, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap'
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata = {
  title: "What's That Command?",
  description: "Find the shell command you forgot. Search git, docker, and bash by intent — not by flag name."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${vt323.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
