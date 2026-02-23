import React from "react";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
export function NotFoundPage() {
  /** Fallback for unknown routes. */
  return (
    <div className="card">
      <h1 className="h1" style={{ marginTop: 0 }}>Page not found</h1>
      <p className="p">That route doesn’t exist. Use the navigation or go back home.</p>
      <div className="row">
        <Link className="btn btnPrimary" to="/">Go home</Link>
        <Link className="btn" to="/nearby">Nearby</Link>
      </div>
    </div>
  );
}
