exports.handler = async () => {
  const url = process.env.SUPABASE_DATABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Supabase is not connected yet.' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, anonKey }),
  };
};
