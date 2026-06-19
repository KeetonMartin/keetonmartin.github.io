import { useEffect, useState } from "react";
import "./App.css";

const SECTIONS = [
  { href: "#top", label: "Start" },
  { href: "#about", label: "About" },
  { href: "#resume", label: "Resume" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" }
];

const PUBLIC_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const getImagePath = (fileName) =>
  `${PUBLIC_URL}/images/${fileName}`;

const getPortfolioImagePath = (fileName) =>
  `${PUBLIC_URL}/images/portfolio/${fileName}`;

function App() {
  const [siteData, setSiteData] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isActive = true;

    fetch(`${PUBLIC_URL}/resumeData.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (isActive) {
          setSiteData(data);
        }
      })
      .catch(() => {
        if (isActive) {
          setLoadError(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (loadError) {
    return (
      <main className="loading-screen">
        <p className="loading-label">Content unavailable</p>
        <h1>Portfolio data could not be loaded.</h1>
      </main>
    );
  }

  if (!siteData) {
    return (
      <main className="loading-screen">
        <p className="loading-label">Loading</p>
        <h1>Building the experience...</h1>
      </main>
    );
  }

  const { main, portfolio, resume } = siteData;
  const socialLinks = main.social || [];
  const githubProfileLinks = [
    { label: "Personal GitHub", href: main.github },
    { label: "Work GitHub", href: main.githubSecondary }
  ].filter((link) => Boolean(link.href));
  const workItems = resume.work || [];
  const educationItems = resume.education || [];
  const skills = resume.skills || [];
  const projects = portfolio.projects || [];
  const rawContactMessage = (main.contactmessage || "").trim();
  const location = [
    main.address?.city,
    main.address?.state,
    main.address?.zip
  ]
    .filter(Boolean)
    .join(", ");
  const baseLocation = [main.address?.city, main.address?.zip]
    .filter(Boolean)
    .join(" ");
  const contactMessage = /Here is where you should write your message/i.test(
    rawContactMessage
  )
    ? "Email is the best starting point for product work, collaborations, or a walkthrough of recent projects."
    : rawContactMessage;

  const heroActions = [
    { href: main.project, label: "Open Project", kind: "primary" },
    ...githubProfileLinks.map((link) => ({
      href: link.href,
      label: link.label,
      kind: "secondary"
    })),
    { href: `mailto:${main.email}`, label: "Send Email", kind: "secondary" }
  ].filter((link) => Boolean(link.href));
  const contactActions = [
    { href: `mailto:${main.email}`, label: "Email Me", kind: "primary" },
    { href: main.resumedownload, label: "Download Resume", kind: "secondary" }
  ]
    .concat(
      githubProfileLinks.map((link) => ({
        href: link.href,
        label: link.label,
        kind: "secondary"
      }))
    )
    .filter((link) => Boolean(link.href));

  const contactItems = [
    { label: "Email", value: main.email, href: `mailto:${main.email}` },
    { label: "Phone", value: main.phone, href: `tel:${main.phone}` },
    { label: "Website", value: main.website, href: main.website },
    {
      label: "Address",
      value: [main.address?.street, location].filter(Boolean).join(", ")
    },
    ...githubProfileLinks.map((link) => ({
      label: link.label,
      value: link.href.replace(/^https?:\/\//, ""),
      href: link.href
    }))
  ].filter((item) => Boolean(item.value));

  return (
    <div className="app-shell">
      <div className="app-shell__glow app-shell__glow--one" />
      <div className="app-shell__glow app-shell__glow--two" />

      <aside className="site-rail">
        <div className="site-rail__inner">
          <div>
            <p className="site-rail__kicker">Keeton Martin</p>
            <a className="site-rail__brand" href="#top">
              {main.name}
            </a>
            <p className="site-rail__summary">{main.description}</p>
          </div>

          <nav className="site-rail__nav" aria-label="Section navigation">
            {SECTIONS.map((section) => (
              <a key={section.href} href={section.href}>
                {section.label}
              </a>
            ))}
          </nav>

          <div className="site-rail__meta">
            <p>Full-stack engineer focused on building useful software.</p>
            <div className="site-rail__social">
              {socialLinks.map((network) => (
                <a key={network.name} href={network.url}>
                  {network.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="site-main">
        <section className="panel hero-panel" id="top">
          <div className="panel-heading">
            <span>Software engineer</span>
            <p>Building thoughtful products and reliable software systems.</p>
          </div>

          <div className="hero-panel__body">
            <div className="hero-panel__copy">
              <p className="eyebrow">Full-stack engineer</p>
              <h1>{main.name}</h1>
              <p className="hero-panel__lede">{main.description}</p>

              <div className="hero-panel__actions">
                {heroActions.map((link) => (
                  <a
                    key={link.label}
                    className={`action-pill action-pill--${link.kind}`}
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="hero-panel__facts">
              <div className="fact-card">
                <span className="fact-card__label">Focus</span>
                <p>{resume.skillmessage}</p>
              </div>
              <div className="fact-card">
                <span className="fact-card__label">Base</span>
                <p>{baseLocation || location || main.address?.street}</p>
              </div>
              <div className="fact-card">
                <span className="fact-card__label">Contact</span>
                <a href={`mailto:${main.email}`}>{main.email}</a>
              </div>
            </div>
          </div>
        </section>

        <section className="panel about-panel" id="about">
          <div className="panel-heading">
            <span>About</span>
            <p>Background, interests, and the best ways to get in touch.</p>
          </div>

          <div className="about-panel__grid">
            <div className="portrait-card">
              <img
                alt={`${main.name} profile`}
                src={getImagePath(main.image)}
              />
            </div>

            <div className="about-panel__story">
              <h2>About Me</h2>
              <p>{main.bio}</p>
            </div>

            <div className="about-panel__details">
              {contactItems.map((item) => (
                <div key={item.label} className="detail-row">
                  <span>{item.label}</span>
                  {item.href ? <a href={item.href}>{item.value}</a> : <p>{item.value}</p>}
                </div>
              ))}
              {main.resumedownload ? (
                <a className="download-link" href={main.resumedownload}>
                  Download Resume
                </a>
              ) : null}
            </div>

            <div className="about-panel__skills">
              <div className="about-panel__skills-copy">
                <h2>Skills</h2>
                <p>{resume.skillmessage}</p>
              </div>

              <div className="skill-list" aria-label="Skills">
                {skills.map((skill) => (
                  <div key={skill} className="skill-pill">
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel resume-panel" id="resume">
          <div className="panel-heading">
            <span>Resume</span>
            <p>Selected experience, education, and technical strengths.</p>
          </div>

          <div className="timeline-grid">
            <div className="timeline-column">
              <div className="timeline-column__header">
                <h2>Work</h2>
                <p>{workItems.length} roles</p>
              </div>
              {workItems.map((item) => (
                <article key={`${item.company}-${item.title}`} className="timeline-card">
                  <p className="timeline-card__eyebrow">{item.years}</p>
                  <h3>{item.company}</h3>
                  <p className="timeline-card__title">{item.title}</p>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>

            <div className="timeline-column">
              <div className="timeline-column__header">
                <h2>Education</h2>
                <p>{educationItems.length} milestones</p>
              </div>
              {educationItems.map((item) => (
                <article key={`${item.school}-${item.degree}`} className="timeline-card">
                  <p className="timeline-card__eyebrow">{item.graduated}</p>
                  <h3>{item.school}</h3>
                  <p className="timeline-card__title">{item.degree}</p>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="panel projects-panel" id="projects">
          <div className="panel-heading">
            <span>Projects</span>
            <p>Recent work, experiments, and product builds.</p>
          </div>

          <div className="project-grid">
            {projects.map((project, index) => (
              <a
                key={`${project.title}-${index}`}
                className="project-card"
                href={project.url}
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(17, 18, 21, 0.08), rgba(17, 18, 21, 0.82)), url(${getPortfolioImagePath(
                    project.image
                  )})`
                }}
              >
                <span className="project-card__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="project-card__content">
                  <h3>{project.title}</h3>
                  <p>{project.category}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="panel contact-panel" id="contact">
          <div className="panel-heading">
            <span>Contact</span>
            <p>Email, resume, and profile links in one place.</p>
          </div>

          <div className="contact-panel__grid">
            <div className="contact-panel__intro">
              <div className="contact-panel__copy">
                <p className="eyebrow">Contact info</p>
                <h2>Reach out directly.</h2>
                <p>{contactMessage}</p>
              </div>

              <div className="contact-panel__actions">
                {contactActions.map((link) => (
                  <a
                    key={link.label}
                    className={`contact-action contact-action--${link.kind}`}
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {socialLinks.length ? (
                <div className="contact-panel__social">
                  <span>Elsewhere</span>
                  <div className="contact-chip-list">
                    {socialLinks.map((network) => (
                      <a key={network.name} className="contact-chip" href={network.url}>
                        {network.name}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="contact-panel__list">
              {contactItems.map((item) => (
                <div key={item.label} className="detail-row">
                  <span>{item.label}</span>
                  {item.href ? <a href={item.href}>{item.value}</a> : <p>{item.value}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
