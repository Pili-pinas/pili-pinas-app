/**
 * @jest-environment node
 */
import { POST } from "../route";

const BACKEND_URL = "https://pili-pinas-api.fly.dev";

function makeRequest(body: object, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/query", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, PILI_PINAS_API_URL: BACKEND_URL };
    jest.resetAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 401 when X-API-Key header is missing", async () => {
    const req = makeRequest({ question: "test" });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 503 when PILI_PINAS_API_URL is not set", async () => {
    delete process.env.PILI_PINAS_API_URL;
    const req = makeRequest({ question: "test" }, { "X-API-Key": "key123" });
    const res = await POST(req);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "API not configured" });
  });

  it("forwards request to backend with X-API-Key and returns response", async () => {
    const mockAnswer = { answer: "Sagot", sources: [], query: "test", chunks_used: 1 };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAnswer,
    });

    const req = makeRequest({ question: "test", top_k: 5 }, { "X-API-Key": "key123" });
    const res = await POST(req);

    expect(global.fetch).toHaveBeenCalledWith(
      `${BACKEND_URL}/query`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-API-Key": "key123" }),
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockAnswer);
  });

  it("forwards non-200 status codes from backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "Rate limited" }),
    });

    const req = makeRequest({ question: "test" }, { "X-API-Key": "key123" });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("returns 502 when backend is unreachable", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    const req = makeRequest({ question: "test" }, { "X-API-Key": "key123" });
    const res = await POST(req);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "Backend unreachable" });
  });

  it("returns error when backend returns non-JSON response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => { throw new SyntaxError("Unexpected token"); },
    });

    const req = makeRequest({ question: "test" }, { "X-API-Key": "key123" });
    const res = await POST(req);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Backend error 503" });
  });
});
