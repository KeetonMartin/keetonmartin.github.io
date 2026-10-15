import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "./App";
import site from "./data/site.json";

it("renders the intro, departures, and route", () => {
  render(<App />);

  expect(screen.getByRole("heading", { level: 1, name: "Keeton Martin" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Departures" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Work and school" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Résumé" })).toBeInTheDocument();
  expect(screen.queryByText(/650-561/)).not.toBeInTheDocument();
});

it("shows six departures and reveals the rest on request", async () => {
  render(<App />);

  const rows = () => document.querySelectorAll(".board__row");

  expect(rows()).toHaveLength(6);

  const more = screen.getByRole("button", { name: `${site.projects.length - 6} more departures` });
  await userEvent.click(more);

  expect(rows()).toHaveLength(site.projects.length);
  expect(more).toHaveAttribute("aria-expanded", "true");
});
