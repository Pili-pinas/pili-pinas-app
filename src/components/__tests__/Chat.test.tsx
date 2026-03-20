import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Chat from "../Chat";

const mockOnUnauthorized = jest.fn();
const TEST_API_KEY = "test-key-123";

const POPULAR_QUESTIONS = [
  { question: "Sino si Marcos?", total_asks: 42, source_type: null, cached_at: "2026-03-17T00:00:00Z" },
  { question: "Ano ang PDAF?", total_asks: 38, source_type: null, cached_at: "2026-03-17T00:00:00Z" },
  { question: "Kailan ang eleksyon?", total_asks: 30, source_type: null, cached_at: "2026-03-17T00:00:00Z" },
];

function mockFetch({
  popular = POPULAR_QUESTIONS,
  popularOk = true,
  queryAnswer = "Test answer",
}: {
  popular?: { question: string; count: number }[];
  popularOk?: boolean;
  queryAnswer?: string;
} = {}) {
  global.fetch = jest.fn().mockImplementation((url: string) => {
    if (url === "/api/popular") {
      return Promise.resolve({
        ok: popularOk,
        status: popularOk ? 200 : 500,
        json: async () => (popularOk ? { questions: popular } : { error: "fail" }),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ answer: queryAnswer, sources: [], query: "q", chunks_used: 1 }),
    });
  });
}

function renderChat() {
  return render(<Chat apiKey={TEST_API_KEY} onUnauthorized={mockOnUnauthorized} />);
}

describe("Chat", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Default: popular returns empty, query tests override as needed
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url === "/api/popular") {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ questions: [] })});
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });
  });

  it("renders empty state prompt", () => {
    renderChat();
    expect(screen.getByText(/magtanong/i)).toBeInTheDocument();
  });

  it("renders input and send button", () => {
    renderChat();
    expect(screen.getByPlaceholderText(/tanong mo dito/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    renderChat();
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("sends message and displays user bubble", async () => {
    mockFetch({ queryAnswer: "Test answer" });

    renderChat();
    const input = screen.getByPlaceholderText(/tanong mo dito/i);
    await userEvent.type(input, "hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("displays assistant response after query", async () => {
    mockFetch({ queryAnswer: "Sagot dito" });

    renderChat();
    await userEvent.type(screen.getByPlaceholderText(/tanong mo dito/i), "hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(screen.getByText("Sagot dito")).toBeInTheDocument());
  });

  it("sends X-API-Key header with query", async () => {
    mockFetch();

    renderChat();
    await userEvent.type(screen.getByPlaceholderText(/tanong mo dito/i), "test");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/query",
        expect.objectContaining({
          headers: expect.objectContaining({ "X-API-Key": TEST_API_KEY }),
        })
      )
    );
  });

  it("calls onUnauthorized when API returns 401", async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url === "/api/popular") {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ questions: [] })});
      }
      return Promise.resolve({ ok: false, status: 401 });
    });

    renderChat();
    await userEvent.type(screen.getByPlaceholderText(/tanong mo dito/i), "test");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(mockOnUnauthorized).toHaveBeenCalled());
  });

  it("shows fallback message when chunks_used is 0", async () => {
    mockFetch({ queryAnswer: "ignored", popular: [] });
    // override to return chunks_used: 0
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url === "/api/popular") {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ questions: [] })});
      }
      return Promise.resolve({
        ok: true, status: 200,
        json: async () => ({ answer: "ignored", sources: [], query: "q", chunks_used: 0 }),
      });
    });

    renderChat();
    await userEvent.type(screen.getByPlaceholderText(/tanong mo dito/i), "test");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/hindi mahanap/i)).toBeInTheDocument()
    );
  });

  it("shows error message on network failure", async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url === "/api/popular") {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ questions: [] })});
      }
      return Promise.reject(new Error("Network error"));
    });

    renderChat();
    await userEvent.type(screen.getByPlaceholderText(/tanong mo dito/i), "test");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    );
  });

  describe("popular questions", () => {
    it("fetches and displays popular questions as buttons on mount", async () => {
      mockFetch();
      renderChat();

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Sino si Marcos?" })).toBeInTheDocument()
      );
      expect(screen.getByRole("button", { name: "Ano ang PDAF?" })).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/popular",
        expect.objectContaining({
          headers: expect.objectContaining({ "X-API-Key": TEST_API_KEY }),
        })
      );
    });

    it("clicking a popular question submits it directly", async () => {
      mockFetch();
      renderChat();

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Sino si Marcos?" })).toBeInTheDocument()
      );

      await userEvent.click(screen.getByRole("button", { name: "Sino si Marcos?" }));

      await waitFor(() =>
        expect(screen.getByText("Sino si Marcos?")).toBeInTheDocument()
      );
    });

    it("hides popular question buttons after first message is sent", async () => {
      mockFetch();
      renderChat();

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Sino si Marcos?" })).toBeInTheDocument()
      );

      await userEvent.click(screen.getByRole("button", { name: "Sino si Marcos?" }));

      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "Sino si Marcos?" })).not.toBeInTheDocument()
      );
    });

    it("does not crash when popular questions fetch fails", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
      renderChat();

      await waitFor(() =>
        expect(screen.getByPlaceholderText(/tanong mo dito/i)).toBeInTheDocument()
      );
      expect(screen.queryByRole("button", { name: /sino/i })).not.toBeInTheDocument();
    });
  });
});
