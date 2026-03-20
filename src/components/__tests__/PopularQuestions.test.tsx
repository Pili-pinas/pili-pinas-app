import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PopularQuestions from "../PopularQuestions";

const TEST_API_KEY = "test-key-123";
const POPULAR = [
  { question: "Sino si Marcos?", total_asks: 42, source_type: null, cached_at: "2026-03-17T00:00:00Z" },
  { question: "Ano ang PDAF?", total_asks: 38, source_type: null, cached_at: "2026-03-17T00:00:00Z" },
];

function mockPopularFetch(data: unknown = { questions: POPULAR }, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => data,
  });
}

describe("PopularQuestions", () => {
  beforeEach(() => jest.resetAllMocks());

  it("renders nothing while loading", () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));
    const { container } = render(
      <PopularQuestions apiKey={TEST_API_KEY} onSelect={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders buttons for each question after fetch", async () => {
    mockPopularFetch();
    render(<PopularQuestions apiKey={TEST_API_KEY} onSelect={jest.fn()} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sino si Marcos?" })).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "Ano ang PDAF?" })).toBeInTheDocument();
  });

  it("fetches with X-API-Key header", async () => {
    mockPopularFetch();
    render(<PopularQuestions apiKey={TEST_API_KEY} onSelect={jest.fn()} />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/popular",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-API-Key": TEST_API_KEY }),
      })
    );
  });

  it("calls onSelect with the question when button is clicked", async () => {
    mockPopularFetch();
    const onSelect = jest.fn();
    render(<PopularQuestions apiKey={TEST_API_KEY} onSelect={onSelect} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sino si Marcos?" })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: "Sino si Marcos?" }));

    expect(onSelect).toHaveBeenCalledWith("Sino si Marcos?");
  });

  it("buttons are disabled when disabled prop is true", async () => {
    mockPopularFetch();
    render(<PopularQuestions apiKey={TEST_API_KEY} onSelect={jest.fn()} disabled />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sino si Marcos?" })).toBeDisabled()
    );
  });

  it("renders nothing when fetch fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    const { container } = render(
      <PopularQuestions apiKey={TEST_API_KEY} onSelect={jest.fn()} />
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when response is not ok", async () => {
    mockPopularFetch(null, false);
    const { container } = render(
      <PopularQuestions apiKey={TEST_API_KEY} onSelect={jest.fn()} />
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(container.firstChild).toBeNull();
  });
});
