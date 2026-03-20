/**
 * @jest-environment node
 */
import { GET } from "../route";

const BACKEND_URL = "https://pili-pinas-api.fly.dev";

function makeRequest(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/popular", {
    method: "GET",
    headers,
  });
}

describe("GET /api/popular", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, PILI_PINAS_API_URL: BACKEND_URL };
    jest.resetAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 401 when X-API-Key header is missing", async () => {
    const req = makeRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 503 when PILI_PINAS_API_URL is not set", async () => {
    delete process.env.PILI_PINAS_API_URL;
    const req = makeRequest({ "X-API-Key": "key123" });
    const res = await GET(req);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "API not configured" });
  });

  it("fetches top 5 popular questions from backend with X-API-Key", async () => {
    const mockData = [
      { question: "Sino si Marcos?", count: 42 },
      { question: "Ano ang PDAF?", count: 38 },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const req = makeRequest({ "X-API-Key": "key123" });
    const res = await GET(req);

    expect(global.fetch).toHaveBeenCalledWith(
      `${BACKEND_URL}/popular?limit=5`,
      expect.objectContaining({
        headers: expect.objectContaining({ "X-API-Key": "key123" }),
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockData);
  });

  it("returns 502 when backend is unreachable", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    const req = makeRequest({ "X-API-Key": "key123" });
    const res = await GET(req);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "Backend unreachable" });
  });

  it("forwards non-200 status codes from backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "Rate limited" }),
    });

    const req = makeRequest({ "X-API-Key": "key123" });
    const res = await GET(req);
    expect(res.status).toBe(429);
  });
});
