import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// PUBLIC_INTERFACE
export function RegisterPage() {
  /** Account creation / onboarding page. */
  const { register, error, status } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("Alex Rider");
  const [email, setEmail] = useState("demo@bikeconnect.app");
  const [password, setPassword] = useState("password");

  const [localError, setLocalError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!displayName || !email || !password) {
      setLocalError("Please complete all fields.");
      return;
    }

    const ok = await register({ displayName, email, password });
    if (ok) navigate("/profile", { replace: true });
  };

  return (
    <div className="grid2">
      <section className="card">
        <div className="pageHeader" style={{ marginTop: 0 }}>
          <div>
            <h1 className="h1">Create your Bike Connect account</h1>
            <p className="p">Set up the basics. You can fine-tune your profile next.</p>
          </div>
          <span className="badge badgePrimary">Onboarding</span>
        </div>

        <form className="stack" onSubmit={onSubmit}>
          <div>
            <div className="label">Display name</div>
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <div className="label">Email</div>
            <input
              className="input"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="label">Password</div>
            <input
              className="input"
              value={password}
              type="password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
            />
          </div>

          <button className="btn btnAccent" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Creating…" : "Create account"}
          </button>

          {(localError || error) && (
            <div className="toast toastError" role="alert">
              {localError || error}
              <div className="mini" style={{ marginTop: 6 }}>
                If backend registration isn’t implemented yet, you’ll see this error until APIs are ready.
              </div>
            </div>
          )}

          <div className="mini">
            Already have an account? <Link to="/auth/login">Sign in</Link>
          </div>
        </form>
      </section>

      <aside className="card">
        <h2 className="cardTitle">What’s next?</h2>
        <div className="stack">
          <div className="badge">Add your pace & riding style</div>
          <div className="badge">Set your approximate location</div>
          <div className="badge">Start exploring nearby cyclists</div>
        </div>
      </aside>
    </div>
  );
}
