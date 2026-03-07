export async function POST(req: Request) {
  const body = await req.json();

  const backendUrl = process.env.PILI_PINAS_API_URL;
  const apiKey = process.env.PILI_PINAS_API_KEY ?? "";

  if (!backendUrl) {
    return Response.json({ error: "API not configured" }, { status: 503 });
  }

  const res = await fetch(`${backendUrl}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
