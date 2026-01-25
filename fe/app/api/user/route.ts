// Placeholder API route for user endpoints
// This file exists to prevent TypeScript build errors
// Actual API implementation should be added here

export async function GET() {
  return new Response(JSON.stringify({ message: 'User API' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
