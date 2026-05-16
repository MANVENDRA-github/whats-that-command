import './globals.css';

export const metadata = {
  title: "What's That Command?",
  description: "Find the shell command you can't remember. Search git, docker, and bash by what you want to do."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
