import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function AppLayout() {
  /** Main application layout with top navigation and outlet. */
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <header className="navbar" role="banner">
        <div className="container navInner">
          <NavLink to="/" className="brand" aria-label="Bike Connect home">
            <span className="brandMark" aria-hidden="true" />
            <span>Bike Connect</span>
          </NavLink>

          <nav className="navLinks" aria-label="Primary">
            <NavLink
              to="/nearby"
              className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
            >
              Nearby
            </NavLink>
            <NavLink
              to="/messages"
              className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
            >
              Messages
            </NavLink>
            <NavLink
              to="/rides"
              className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
            >
              Group rides
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
            >
              Profile
            </NavLink>
          </nav>

          <div className="rightActions">
            {isAuthenticated ? (
              <>
                <span className="badge">
                  <span aria-hidden="true">•</span>
                  {user?.display_name || user?.email || "Signed in"}
                </span>
                <button className="btn btnSm" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <NavLink className="btn btnPrimary btnSm" to="/auth/login">
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="container page" role="main">
        <Outlet />
      </main>
    </>
  );
}
