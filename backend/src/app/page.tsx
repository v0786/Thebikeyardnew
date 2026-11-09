export const dynamic = 'force-dynamic';

const ENDPOINTS = [
  { method: 'GET', path: '/api/health', auth: 'none' },
  { method: 'GET', path: '/api/auth/session', auth: 'next-auth' },
  { method: 'POST', path: '/api/auth/callback/credentials', auth: 'next-auth' },
  { method: 'POST', path: '/api/sales', auth: 'Manager / Super Admin / Owner' },
];

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720 }}>
      <h1>The Bike Yard — Backend</h1>
      <p>
        Next.js 16 + Prisma dealership backend. This service exposes JSON APIs consumed by the
        showroom frontend and the admin/staff clients.
      </p>
      <h2>Available endpoints</h2>
      <table cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Method</th>
            <th align="left">Path</th>
            <th align="left">Auth</th>
          </tr>
        </thead>
        <tbody>
          {ENDPOINTS.map((e) => (
            <tr key={`${e.method} ${e.path}`}>
              <td>{e.method}</td>
              <td>
                <code>{e.path}</code>
              </td>
              <td>{e.auth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
