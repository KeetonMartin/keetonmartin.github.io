import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
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
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResumeData)
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

it("renders without crashing", async () => {
  const div = document.createElement("div");

  await act(async () => {
    ReactDOM.render(<App />, div);
  });

  expect(global.fetch).toHaveBeenCalled();
  expect(div.textContent).toContain("Reach out directly.");
  expect(div.textContent).not.toContain("Contact Prompt");
  expect(div.textContent).toContain("Skills");
  expect(div.textContent).toContain("Projects");
  ReactDOM.unmountComponentAtNode(div);
});
