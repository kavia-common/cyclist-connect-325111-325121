import React, { useMemo, useState } from "react";
import { api } from "../api/client";

function initials(nameOrEmail) {
  const s = (nameOrEmail || "?").trim();
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
}

const MOCK_RESULTS = [
  { id: "u1", name: "Jordan", pace: "steady", bike_type: "gravel", distance_km: 1.2 },
  { id: "u2", name: "Sam", pace: "fast", bike_type: "road", distance_km: 3.8 },
  { id: "u3", name: "Taylor", pace: "casual", bike_type: "commuter", distance_km: 0.9 },
];

// PUBLIC_INTERFACE
export function NearbyPage() {
  /** Map-based nearby cyclists search page. */
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);
  const [radiusKm, setRadiusKm] = useState(5);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(MOCK_RESULTS);
  const [toast, setToast] = useState(null);

  const subtitle = useMemo(
    () => `Search within ${radiusKm}km of (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    [lat, lng, radiusKm]
  );

  const search = async () => {
    setLoading(true);
    setToast(null);
    try {
      const data = await api.nearby.search({ lat, lng, radiusKm });
      // Support either {items:[...]} or array response.
      const items = Array.isArray(data) ? data : data?.items || [];
      setResults(items);
      if (!items.length) setToast({ type: "success", message: "No riders found in this area yet." });
    } catch (e) {
      // Fall back to mock content so UI remains usable.
      setResults(MOCK_RESULTS);
      setToast({ type: "error", message: e?.message || "Nearby search failed (API not ready). Showing sample data." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid2">
      <section className="card">
        <div className="pageHeader" style={{ marginTop: 0 }}>
          <div>
            <h1 className="h1">Nearby cyclists</h1>
            <p className="p">{subtitle}</p>
          </div>
          <button className="btn btnPrimary" onClick={search} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        <div className="mapShell" aria-label="Map area (placeholder)">
          Map view (placeholder) — integrate Mapbox/Leaflet in a later step
        </div>

        <div className="divider" />

        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 150, flex: 1 }}>
            <div className="label">Latitude</div>
            <input
              className="input"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              inputMode="decimal"
            />
          </div>
          <div style={{ minWidth: 150, flex: 1 }}>
            <div className="label">Longitude</div>
            <input
              className="input"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              inputMode="decimal"
            />
          </div>
          <div style={{ minWidth: 150, flex: 1 }}>
            <div className="label">Radius (km)</div>
            <input
              className="input"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              inputMode="numeric"
            />
          </div>
        </div>

        {toast && (
          <div className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`} role="status">
            {toast.message}
          </div>
        )}
      </section>

      <aside className="card">
        <h2 className="cardTitle">Results</h2>
        <div className="mini">Tap a rider to message them (wiring happens in a later step).</div>

        <div className="divider" />

        <div className="stack">
          {(results || []).map((r) => (
            <div key={r.id || r.user_id} className="row" style={{ justifyContent: "space-between" }}>
              <div className="row">
                <div className="avatar" aria-hidden="true">
                  {initials(r.name || r.display_name || r.email)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
                    {r.name || r.display_name || r.email || "Rider"}
                  </div>
                  <div className="mini">
                    {r.pace || "pace?"} • {r.bike_type || r.bikeType || "bike?"}
                  </div>
                </div>
              </div>
              <span className="badge">
                {(r.distance_km ?? r.distanceKm ?? 0).toFixed(1)}km
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
