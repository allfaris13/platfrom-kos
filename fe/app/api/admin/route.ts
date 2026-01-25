// Placeholder API route for admin endpoints
// This file exists to prevent TypeScript build errors
// Actual API implementation should be added here

export async function GET() {
  return new Response(JSON.stringify({ message: 'Admin API' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
