import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Chat from "../Chat";

const mockOnUnauthorized = jest.fn();
const TEST_API_KEY = "test-key-123";

function renderChat() {
  return render(<Chat apiKey={TEST_API_KEY} onUnauthorized={mockOnUnauthorized} />);
}

describe("Chat", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Test answer", sources: [], query: "hello", chunks_used: 1 }),
    });

    renderChat();
    const input = screen.getByPlaceholderText(/tanong mo dito/i);
    await userEvent.type(input, "hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("displays assistant response after query", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ answer: "Sagot dito", sources: [], query: "hello", chunks_used: 1 }),
    });

    renderChat();
    await userEvent.type(screen.getByPlaceholderText(/tanong mo dito/i), "hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(screen.getByText("Sagot dito")).toBeInTheDocument());
  });

  it("sends X-API-Key header with query", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ answer: "ok", sources: [], query: "q", chunks_used: 1 }),
    });

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
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 });

    renderChat();
    await userEvent.type(screen.getByPlaceholderText(/tanong mo dito/i), "test");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(mockOnUnauthorized).toHaveBeenCalled());
  });

  it("shows fallback message when chunks_used is 0", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ answer: "ignored", sources: [], query: "q", chunks_used: 0 }),
    });

    renderChat();
    await userEvent.type(screen.getByPlaceholderText(/tanong mo dito/i), "test");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/hindi mahanap/i)).toBeInTheDocument()
    );
  });

  it("shows error message on network failure", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    renderChat();
    await userEvent.type(screen.getByPlaceholderText(/tanong mo dito/i), "test");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    );
  });
});
