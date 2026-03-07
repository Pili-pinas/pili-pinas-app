import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatPage from "../page";

jest.mock("@/components/Chat", () => ({
  __esModule: true,
  default: ({ apiKey }: { apiKey: string }) => <div data-testid="chat">{apiKey}</div>,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const AUTH_URL = "https://rag-pipeline-91ct.vercel.app";

describe("ChatPage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it("shows login form when no apiKey in localStorage", async () => {
    render(<ChatPage />);
    await waitFor(() => expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument());
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows chat when apiKey exists in localStorage", async () => {
    localStorage.setItem("apiKey", "stored-key");
    render(<ChatPage />);
    await waitFor(() => expect(screen.getByTestId("chat")).toBeInTheDocument());
    expect(screen.getByText("stored-key")).toBeInTheDocument();
  });

  it("logs in successfully and shows chat", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ api_key: "new-key" }),
    });

    render(<ChatPage />);
    await waitFor(() => screen.getByPlaceholderText(/email/i));

    await userEvent.type(screen.getByPlaceholderText(/email/i), "user@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      `${AUTH_URL}/api/users/login`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "password123" }),
      })
    );

    await waitFor(() => expect(screen.getByTestId("chat")).toBeInTheDocument());
    expect(localStorage.getItem("apiKey")).toBe("new-key");
  });

  it("shows error on invalid credentials (401)", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 });

    render(<ChatPage />);
    await waitFor(() => screen.getByPlaceholderText(/email/i));

    await userEvent.type(screen.getByPlaceholderText(/email/i), "bad@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    );
  });

  it("shows error on network failure", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    render(<ChatPage />);
    await waitFor(() => screen.getByPlaceholderText(/email/i));

    await userEvent.type(screen.getByPlaceholderText(/email/i), "user@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "pass");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(screen.getByText(/could not reach the server/i)).toBeInTheDocument()
    );
  });

  it("logout clears localStorage and shows login form", async () => {
    localStorage.setItem("apiKey", "existing-key");
    render(<ChatPage />);
    await waitFor(() => screen.getByTestId("chat"));

    await userEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(localStorage.getItem("apiKey")).toBeNull();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    );
  });
});
