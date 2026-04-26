import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { getGameStore } from "@/store/gameStore";

beforeEach(() => {
  localStorage.clear();
  getGameStore().getState().resetGame();
});

afterEach(() => {
  cleanup();
});
