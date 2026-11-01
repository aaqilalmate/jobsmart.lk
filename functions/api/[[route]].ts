export const onRequest = async () => new Response(
  JSON.stringify({ error: 'This legacy API has been retired. Configure Supabase for job and admin operations.' }),
  { status: 503, headers: { 'Content-Type': 'application/json' } },
);
