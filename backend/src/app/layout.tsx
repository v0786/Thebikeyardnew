import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Bike Yard — Backend API',
  description: 'The Bike Yard motorcycle dealership backend (Next.js 16 + Prisma).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
