export async function POST(req: Request) {
  const body = await req.json();

  const backendUrl = process.env.PILI_PINAS_API_URL;
  const apiKey = req.headers.get("X-API-Key");

  if (!backendUrl) {
    return Response.json({ error: "API not configured" }, { status: 503 });
  }

  if (!apiKey) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return Response.json({ error: "Backend unreachable" }, { status: 502 });
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return Response.json({ error: `Backend error ${res.status}` }, { status: res.status || 502 });
  }

  return Response.json(data, { status: res.status });
}
