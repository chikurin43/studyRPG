import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "@/app/App";

describe("App", () => {
  it("supports the core task -> growth -> raid flow", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(screen.getByLabelText("タイトル"), "長めの勉強セッション");
    await user.clear(screen.getByLabelText("時間 (分)"));
    await user.type(screen.getByLabelText("時間 (分)"), "60");
    await user.selectOptions(screen.getByLabelText("難易度"), "5");
    await user.click(screen.getByRole("button", { name: "タスクを登録" }));

    expect(screen.getByText("長めの勉強セッション")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Start/i })[0]);
    expect(screen.getByText(/Active Timer/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Complete/i })[0]);
    expect(screen.getByText(/EXP \+/)).toBeInTheDocument();
    expect(screen.getByText(/Pending choices 2/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Monster/ }));
    expect(screen.getByText(/レベルアップの3択/)).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "この強化を選ぶ" })[0]);
    expect(screen.getByText(/Pending choices 1/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Raid/ }));
    const attackButton = screen.getByRole("button", { name: /Attack \(20 Energy\)/ });
    expect(attackButton).toBeEnabled();
    await user.click(attackButton);

    expect(screen.getByText(/今日の挑戦は使用済み/)).toBeInTheDocument();
    expect(screen.getByText(/Stage 1:/)).toBeInTheDocument();
  });
});
