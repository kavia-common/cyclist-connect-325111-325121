import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const MOCK_RIDES = [
  { id: "r1", title: "Sunrise Loop", date: "2026-03-02", time: "06:30", pace: "steady", distance_km: 42, start: "Golden Gate Park" },
  { id: "r2", title: "Midweek Gravel", date: "2026-03-05", time: "18:15", pace: "casual", distance_km: 28, start: "Presidio" },
  { id: "r3", title: "Saturday Sprints", date: "2026-03-08", time: "08:00", pace: "fast", distance_km: 55, start: "Embarcadero" },
];

function formatDayLabel(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// PUBLIC_INTERFACE
export function RidesPage() {
  /** Group rides / events page with creation form and calendar preview. */
  const [rides, setRides] = useState(MOCK_RIDES);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [draft, setDraft] = useState({
    title: "City coffee ride",
    date: "2026-03-10",
    time: "09:00",
    pace: "casual",
    distance_km: 25,
    start: "Downtown",
    notes: "Coffee stop included.",
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setToast(null);
      try {
        const data = await api.rides.list();
        const items = Array.isArray(data) ? data : data?.items || [];
        if (!ignore && items.length) {
          setRides(items.map((r) => ({
            id: r.id || r.ride_id || r.rideId,
            title: r.title || "Ride",
            date: r.date || r.start_date || r.startDate || "",
            time: r.time || r.start_time || r.startTime || "",
            pace: r.pace || "steady",
            distance_km: r.distance_km ?? r.distanceKm ?? 0,
            start: r.start || r.start_location || r.startLocation || "",
            notes: r.notes || "",
          })));
        }
      } catch (e) {
        setToast({ type: "error", message: e?.message || "Rides API not ready. Showing sample events." });
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const create = async () => {
    setToast(null);
    try {
      const created = await api.rides.create(draft);
      const newRide = created?.id ? created : { ...draft, id: `local-${Date.now()}` };
      setRides((prev) => [newRide, ...prev]);
      setToast({ type: "success", message: "Ride created." });
    } catch (e) {
      // Still allow UI demo even if API not ready
      setRides((prev) => [{ ...draft, id: `local-${Date.now()}` }, ...prev]);
      setToast({ type: "error", message: e?.message || "Create failed (API not ready). Added locally." });
    }
  };

  const upcoming = useMemo(() => rides.slice(0, 6), [rides]);

  // Simple “next 14 days” calendar preview
  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const arr = [];
    for (let i = 0; i < 14; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      arr.push(iso);
    }
    return arr;
  }, []);

  const ridesByDay = useMemo(() => {
    const map = new Map();
    for (const r of rides) {
      const key = r.date || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return map;
  }, [rides]);

  return (
    <div className="grid2">
      <section className="card">
        <div className="pageHeader" style={{ marginTop: 0 }}>
          <div>
            <h1 className="h1">Group rides</h1>
            <p className="p">Create events and invite riders. {loading ? "Loading…" : ""}</p>
          </div>
          <span className="badge badgePrimary">{rides.length} rides</span>
        </div>

        <h2 className="cardTitle">Create a ride</h2>
        <div className="stack">
          <div>
            <div className="label">Title</div>
            <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>

          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="label">Date</div>
              <input
                className="input"
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div className="label">Time</div>
              <input
                className="input"
                type="time"
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              />
            </div>
          </div>

          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="label">Pace</div>
              <select
                className="select"
                value={draft.pace}
                onChange={(e) => setDraft({ ...draft, pace: e.target.value })}
              >
                <option value="casual">Casual</option>
                <option value="steady">Steady</option>
                <option value="fast">Fast</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div className="label">Distance (km)</div>
              <input
                className="input"
                inputMode="numeric"
                value={draft.distance_km}
                onChange={(e) => setDraft({ ...draft, distance_km: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <div className="label">Start location</div>
            <input className="input" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
          </div>

          <div>
            <div className="label">Notes</div>
            <textarea
              className="textarea"
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn btnAccent" onClick={create}>
              Create ride
            </button>
          </div>

          {toast && (
            <div className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`} role="status">
              {toast.message}
            </div>
          )}
        </div>
      </section>

      <aside className="card">
        <h2 className="cardTitle">Upcoming</h2>
        <div className="stack">
          {upcoming.map((r) => (
            <div key={r.id} className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>{r.title}</div>
                <div className="mini">
                  {formatDayLabel(r.date)} • {r.time} • {r.pace} • {r.distance_km}km
                </div>
                <div className="mini">{r.start}</div>
              </div>
              <span className="badge">{r.pace}</span>
            </div>
          ))}
        </div>

        <div className="divider" />

        <h2 className="cardTitle">Calendar preview</h2>
        <div className="calendarGrid" aria-label="Ride calendar preview (next 14 days)">
          {days.map((d) => {
            const items = ridesByDay.get(d) || [];
            return (
              <div className="calendarCell" key={d}>
                <strong>{new Date(`${d}T00:00:00`).getDate()}</strong>
                {items.slice(0, 2).map((r) => (
                  <div key={r.id} className="smallPill" style={{ marginBottom: 6 }}>
                    {r.title}
                  </div>
                ))}
                {items.length > 2 ? <div className="mini">+{items.length - 2} more</div> : null}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
