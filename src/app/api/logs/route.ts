import { NextRequest } from 'next/server';

export const runtime = 'edge';

const ES_NODE = process.env.ELASTIC_NODE || 'https://lawpath-test-cluster-aba117.es.ap-southeast-1.aws.elastic.cloud:443';
const ES_API_KEY = process.env.ELASTIC_API_KEY || 'VE9XcHhKZ0J4OExRWE1hZ0luMmI6amloV1pGWnFDVzJYWGRQVW92RjJ3UQ==';
const INDEX = process.env.ELASTIC_INDEX || 'ashish-bajracharya-index';

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' }, ...init });
}

export async function GET() {
  // Return recent 20 logs
  const url = `${ES_NODE}/${INDEX}/_search`;
  const body = {
    size: 20,
    sort: [{ at: { order: 'desc' } }],
    query: { match_all: {} },
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${ES_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) return json({ hits: [] });
  const data = await resp.json();
  const hits = (data.hits?.hits || []).map((h: any) => ({ id: h._id, ...h._source }));
  return json({ hits });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const doc = { ...body };
  const url = `${ES_NODE}/${INDEX}/_doc`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${ES_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(doc),
  });
  if (!resp.ok) {
    const text = await resp.text();
    return json({ ok: false, error: text }, { status: 500 });
  }
  return json({ ok: true });
}


