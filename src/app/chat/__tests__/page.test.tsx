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

  // --- Auth gate ---

  it("shows chat when apiKey exists in localStorage", async () => {
    localStorage.setItem("apiKey", "stored-key");
    render(<ChatPage />);
    await waitFor(() => expect(screen.getByTestId("chat")).toBeInTheDocument());
    expect(screen.getByText("stored-key")).toBeInTheDocument();
  });

  it("logout clears localStorage and shows auth form", async () => {
    localStorage.setItem("apiKey", "existing-key");
    render(<ChatPage />);
    await waitFor(() => screen.getByTestId("chat"));

    await userEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(localStorage.getItem("apiKey")).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: /login/i })).toBeInTheDocument()
    );
  });

  // --- Tab switching ---

  it("shows Login and Token tabs by default", async () => {
    render(<ChatPage />);
    await waitFor(() => screen.getByRole("tab", { name: /login/i }));
    expect(screen.getByRole("tab", { name: /token/i })).toBeInTheDocument();
  });

  it("login tab is selected by default", async () => {
    render(<ChatPage />);
    await waitFor(() => screen.getByRole("tab", { name: /login/i }));
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it("switching to token tab shows token input", async () => {
    render(<ChatPage />);
    await waitFor(() => screen.getByRole("tab", { name: /token/i }));
    await userEvent.click(screen.getByRole("tab", { name: /token/i }));
    expect(screen.getByPlaceholderText(/paste your api token/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/email/i)).not.toBeInTheDocument();
  });

  it("switching back to login tab shows email/password form", async () => {
    render(<ChatPage />);
    await waitFor(() => screen.getByRole("tab", { name: /token/i }));
    await userEvent.click(screen.getByRole("tab", { name: /token/i }));
    await userEvent.click(screen.getByRole("tab", { name: /login/i }));
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  // --- Login tab ---

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

  it("shows error on network failure during login", async () => {
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

  // --- Token tab ---

  it("entering a token saves it and shows chat", async () => {
    render(<ChatPage />);
    await waitFor(() => screen.getByRole("tab", { name: /token/i }));
    await userEvent.click(screen.getByRole("tab", { name: /token/i }));

    await userEvent.type(screen.getByPlaceholderText(/paste your api token/i), "my-token-abc");
    await userEvent.click(screen.getByRole("button", { name: /use token/i }));

    await waitFor(() => expect(screen.getByTestId("chat")).toBeInTheDocument());
    expect(localStorage.getItem("apiKey")).toBe("my-token-abc");
  });

  it("token submit button is disabled when input is empty", async () => {
    render(<ChatPage />);
    await waitFor(() => screen.getByRole("tab", { name: /token/i }));
    await userEvent.click(screen.getByRole("tab", { name: /token/i }));
    expect(screen.getByRole("button", { name: /use token/i })).toBeDisabled();
  });

  it("clears error when switching tabs", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 });

    render(<ChatPage />);
    await waitFor(() => screen.getByPlaceholderText(/email/i));

    await userEvent.type(screen.getByPlaceholderText(/email/i), "bad@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => screen.getByText(/invalid email or password/i));

    await userEvent.click(screen.getByRole("tab", { name: /token/i }));
    expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
  });
});
