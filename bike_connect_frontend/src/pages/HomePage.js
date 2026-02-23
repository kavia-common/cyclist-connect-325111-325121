import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function HomePage() {
  /** Landing/onboarding page. */
  const { isAuthenticated } = useAuth();

  return (
    <div className="grid2">
      <section className="card">
        <div className="pageHeader" style={{ marginTop: 0 }}>
          <div>
            <h1 className="h1">Find your next ride buddy nearby</h1>
            <p className="p">
              Bike Connect helps cyclists discover nearby riders, chat safely, and plan group rides.
            </p>
          </div>
          <span className="badge badgePrimary">Light • Modern • Fast</span>
        </div>

        <div className="divider" />

        <div className="stack">
          <div className="row">
            <span className="badge badgePrimary">1</span>
            <div>
              <div style={{ fontWeight: 700 }}>Create your profile</div>
              <div className="mini">Add your riding style, pace, and what you’re looking for.</div>
            </div>
          </div>
          <div className="row">
            <span className="badge badgePrimary">2</span>
            <div>
              <div style={{ fontWeight: 700 }}>Explore nearby cyclists</div>
              <div className="mini">Use map-based search to find riders in your area.</div>
            </div>
          </div>
          <div className="row">
            <span className="badge badgePrimary">3</span>
            <div>
              <div style={{ fontWeight: 700 }}>Message & organize group rides</div>
              <div className="mini">Chat with riders and create public or private ride events.</div>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div className="mini">Tip: set your approximate location to improve matches.</div>
          {isAuthenticated ? (
            <Link className="btn btnPrimary" to="/nearby">
              Start exploring
            </Link>
          ) : (
            <div className="row">
              <Link className="btn btnPrimary" to="/auth/register">
                Create account
              </Link>
              <Link className="btn" to="/auth/login">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </section>

      <aside className="card">
        <h2 className="cardTitle">Quick preview</h2>
        <div className="mini">
          This UI is ready for backend integration. If the backend endpoints differ, we’ll align the client in a later step.
        </div>

        <div className="divider" />

        <div className="stack">
          <div className="badge">Map search • radius filter • callouts</div>
          <div className="badge">Chat panels • conversations • composer</div>
          <div className="badge">Group rides • create • calendar</div>
          <div className="badge">Profile • edit • preferences</div>
        </div>
      </aside>
    </div>
  );
}
