import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App";

const mockResumeData = {
  main: {
    name: "Keeton Martin",
    description: "Portfolio description",
    image: "profilepic.jpg",
    bio: "Bio copy",
    contactmessage: "Contact copy",
    email: "test@example.com",
    phone: "555-555-5555",
    github: "https://github.com/example",
    githubSecondary: "https://github.com/work-example",
    project: "https://example.com/project",
    website: "https://example.com",
    resumedownload: "https://example.com/resume.pdf",
    address: {
      street: "123 Main St",
      city: "Brooklyn",
      state: "NY",
      zip: "11201"
    },
    social: []
  },
  resume: {
    skillmessage: "Skill summary",
    education: [],
    work: [],
    skills: []
  },
  portfolio: {
    projects: []
  }
};

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResumeData)
    })
  );
});

afterEach(() => {
  vi.resetAllMocks();
});

it("renders without crashing", async () => {
  render(<App />);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled();
  });

  expect(screen.getByText("Reach out directly.")).toBeInTheDocument();
  expect(screen.queryByText("Contact Prompt")).not.toBeInTheDocument();
  expect(screen.getByText("Skills")).toBeInTheDocument();
  expect(screen.getAllByText("Projects").length).toBeGreaterThan(0);
});
