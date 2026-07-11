import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AsyncBoundary } from "./AsyncBoundary";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

function Fortune({ fetcher }: { fetcher: () => Promise<string> }) {
  const { data } = useSuspenseQuery({
    queryKey: ["fortune"],
    queryFn: fetcher,
  });
  return <p>{data}</p>;
}

describe("AsyncBoundary", () => {
  it("로딩 중에는 pending fallback을, 완료 후에는 데이터를 보여준다", async () => {
    renderWithQuery(
      <AsyncBoundary>
        <Fortune fetcher={() => Promise.resolve("대길")} />
      </AsyncBoundary>,
    );

    expect(
      screen.getByRole("status", { name: "불러오는 중" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("대길")).toBeInTheDocument();
  });

  it("쿼리 에러를 잡아 error fallback을 보여주고, 다시 시도가 쿼리를 리셋한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("점괘 조회 실패"))
      .mockResolvedValueOnce("대길");

    renderWithQuery(
      <AsyncBoundary>
        <Fortune fetcher={fetcher} />
      </AsyncBoundary>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "점괘 조회 실패",
    );

    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("대길")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
