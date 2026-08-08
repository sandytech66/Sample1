const { createClient } = require('@supabase/supabase-js');

const getClient = () => {
  const url = process.env.SUPABASE_DATABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not connected yet (missing SUPABASE_DATABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }
  return createClient(url, key);
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const supabase = getClient();

    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const records = data.map((row) => ({
        id: row.id,
        name: row.name,
        age: row.age,
        docName: row.doc_name,
        docSize: row.doc_size,
        dataUrl: row.data_url,
        storagePath: row.storage_path,
        createdAt: row.created_at,
      }));
      return { statusCode: 200, headers, body: JSON.stringify(records) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, age, docName, docSize, dataUrl, storagePath } = body;

      if (!name || age === undefined || age === null || !docName || !dataUrl) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          name,
          age,
          doc_name: docName,
          doc_size: docSize,
          data_url: dataUrl,
          storage_path: storagePath || null,
        })
        .select()
        .single();
      if (error) throw error;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: data.id,
          name: data.name,
          age: data.age,
          docName: data.doc_name,
          docSize: data.doc_size,
          dataUrl: data.data_url,
          storagePath: data.storage_path,
          createdAt: data.created_at,
        }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id' }) };
      }

      const { data: existing } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;

      if (existing && existing.storage_path) {
        await supabase.storage.from('documents').remove([existing.storage_path]);
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
