import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// PUBLIC_INTERFACE
export function LoginPage() {
  /** Sign-in page. */
  const { login, error, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => location.state?.from || "/nearby", [location.state]);

  const [email, setEmail] = useState("demo@bikeconnect.app");
  const [password, setPassword] = useState("password");

  const [localError, setLocalError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Please enter your email and password.");
      return;
    }

    const ok = await login({ email, password });
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className="grid2">
      <section className="card">
        <div className="pageHeader" style={{ marginTop: 0 }}>
          <div>
            <h1 className="h1">Welcome back</h1>
            <p className="p">Sign in to message cyclists and plan group rides.</p>
          </div>
          <span className="badge badgePrimary">Secure</span>
        </div>

        <form className="stack" onSubmit={onSubmit}>
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
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="btn btnPrimary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Signing in…" : "Sign in"}
          </button>

          {(localError || error) && (
            <div className="toast toastError" role="alert">
              {localError || error}
              <div className="mini" style={{ marginTop: 6 }}>
                If backend auth isn’t implemented yet, you’ll see this error until APIs are ready.
              </div>
            </div>
          )}

          <div className="mini">
            New here? <Link to="/auth/register">Create an account</Link>
          </div>
        </form>
      </section>

      <aside className="card">
        <h2 className="cardTitle">Why sign in?</h2>
        <div className="stack">
          <div className="badge">Save your profile and preferences</div>
          <div className="badge">Start conversations with riders nearby</div>
          <div className="badge">Create and RSVP to group rides</div>
        </div>

        <div className="divider" />

        <div className="mini">
          Redirect after sign-in: <span className="kbd">{from}</span>
        </div>
      </aside>
    </div>
  );
}
