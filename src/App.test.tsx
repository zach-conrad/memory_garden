import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import App from "./App";

/**
 * MVP smoke tests (WBS 5.2), mapped to the success criteria in the
 * project plan's risk analysis:
 *   1. Open the application
 *   2. Explore the garden
 *   3. Create a memory
 *   4. Place the memory in the garden
 */

beforeEach(() => {
  localStorage.clear();
});

describe("Memory Gardens MVP", () => {
  it("opens the application on the landing page", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /enter the garden/i }),
    ).toBeInTheDocument();
  });

  it("enters the garden from the landing page", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /enter the garden/i }));
    expect(screen.getByTestId("garden")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("plants a memory and grows a blossom at the clicked spot", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /enter the garden/i }));

    // Click open ground (pointer down + up with no movement).
    await user.click(screen.getByTestId("garden"));

    // Fill the planting form.
    await user.type(screen.getByLabelText(/title/i), "First bloom");
    await user.type(screen.getByLabelText(/the memory/i), "Our kickoff meeting.");
    await user.click(screen.getByRole("button", { name: /plant memory/i }));

    // The blossom now lives in the garden.
    expect(
      await screen.findByRole("button", { name: /open memory: first bloom/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 memory/i)).toBeInTheDocument();
  });

  it("opens a planted memory for viewing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /enter the garden/i }));
    await user.click(screen.getByTestId("garden"));
    await user.type(screen.getByLabelText(/title/i), "Coast drive");
    await user.type(screen.getByLabelText(/the memory/i), "Windows down, radio up.");
    await user.click(screen.getByRole("button", { name: /plant memory/i }));

    await user.click(
      await screen.findByRole("button", { name: /open memory: coast drive/i }),
    );
    expect(screen.getByText(/windows down, radio up/i)).toBeInTheDocument();
    expect(screen.getByText(/planted by anonymous/i)).toBeInTheDocument();
  });
});
