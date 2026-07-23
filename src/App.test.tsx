import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest"; //added vi for spying
import App from "./App";
import * as AuthContextModule from "./context/AuthContext"; //imported module to spy on useAuth

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
  vi.restoreAllMocks(); // reset all mocks between test runs to prevent state leaking
});

describe("Memory Gardens MVP", () => {
  //test 1 - verify landing page renders when unauthenticated
  it("opens the application on the landing page", () => {
    // return user: null so AppContent renders Landing
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });
    
    render(<App />);
    expect(
      screen.getByRole("button", { name: /sign in with google to enter/i }),
    ).toBeInTheDocument();
  });

  //TEST 2: verify garden view renders when authenticated
  it("enters the garden from the landing page", async () => {
    // Return active user so AppContent bypasses landing and renders <Garden />
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {id: "test-user-id", email: "test@example.com"} as any,
      loading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    })    
    render(<App />);

    //await async findByTestId to resolve garden element before asserting 
    const gardenEl = await screen.findByTestId("garden");
    expect(gardenEl).toBeInTheDocument;

  });

    //TEST 3: verify planting a memory adds a blossom
  it("plants a memory and grows a blossom at the clicked spot", async () => {
    // Mock authed user state
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {id: "test-user-id", email: "test@example.com"} as any,
      loading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    })

    const user = userEvent.setup();
    render(<App />);

    //await finding garden canvas element, then click to open planting modal
    const gardenEl = await screen.findByTestId("garden");
    await user.click(gardenEl);

    // Fill the planting form.
    await user.type(screen.getByLabelText(/title/i), "First bloom");
    await user.type(screen.getByLabelText(/the memory/i), "Our kickoff meeting.");
    await user.click(screen.getByRole("button", { name: /plant memory/i }));

    // verify blossom button appears now in DOM and counter updates
    expect(
      await screen.findByRole("button", { name: /open memory: first bloom/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 memory/i)).toBeInTheDocument();
  });


  it("opens a planted memory for viewing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /sign in with google to enter/i }));
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
