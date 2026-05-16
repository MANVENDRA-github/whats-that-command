import { Fraunces, Spline_Sans, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap'
});

const splineSans = Spline_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-spline-sans',
  display: 'swap'
});

const splineSansMono = Spline_Sans_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-spline-sans-mono',
  display: 'swap'
});

export const metadata = {
  title: "What's That Command?",
  description: "Find the shell command you forgot. Search git, docker, and bash by intent — not by flag name."
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${splineSans.variable} ${splineSansMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
