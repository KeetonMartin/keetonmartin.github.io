import "./App.css";
import site from "./data/site.json";
import Board from "./components/Board";
import Route from "./components/Route";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function App() {
  return (
    <div className="site">
      <header className="hero page">
        <div className="hero__top">
          <div>
            <p className="label">
              {site.role} &middot; {site.city}
            </p>
            <h1 className="hero__name">{site.name}</h1>
          </div>
          <img
            className="hero__photo"
            src={`${BASE}/images/${site.photo}`}
            alt={`Portrait of ${site.name}`}
            width="112"
            height="112"
          />
        </div>
        <div className="hero__track" aria-hidden="true" />
        {site.intro.map((paragraph) => (
          <p key={paragraph} className="hero__intro">
            {paragraph}
          </p>
        ))}
        <nav className="links" aria-label="Elsewhere">
          {site.links.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <div className="board-wrap">
          <Board projects={site.projects} initialCount={6} />
        </div>

        <section className="page section" aria-labelledby="route">
          <h2 id="route" className="label">
            The route so far
          </h2>
          <Route stops={site.route} />
        </section>

        <section className="page section" aria-labelledby="off-duty">
          <h2 id="off-duty" className="label">
            Off duty
          </h2>
          <p className="prose">{site.offDuty}</p>
        </section>
      </main>

      <footer className="footer page">
        <span>
          {site.name} &middot; {site.city}
        </span>
        <span className="footer__end">
          End of the line
          <span className="buffer-stop" aria-hidden="true" />
        </span>
      </footer>
    </div>
  );
}

export default App;
