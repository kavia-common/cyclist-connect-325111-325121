import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const DEFAULT_PROFILE = {
  display_name: "",
  bio: "",
  pace: "casual",
  bike_type: "road",
  looking_for: "friends",
  home_base: "",
};

// PUBLIC_INTERFACE
export function ProfilePage() {
  /** Profile view/edit page. */
  const { user, status } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setToast(null);
    // Seed profile with whatever "me" contains.
    setProfile((p) => ({
      ...p,
      display_name: user?.display_name || user?.name || p.display_name,
    }));
  }, [user]);

  const save = async () => {
    setSaving(true);
    setToast(null);
    try {
      await api.profiles.updateMe(profile);
      setToast({ type: "success", message: "Profile saved." });
    } catch (e) {
      // Still allow UI flow even if API is not ready.
      setToast({ type: "error", message: e?.message || "Failed to save profile (API not ready)." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid2">
      <section className="card">
        <div className="pageHeader" style={{ marginTop: 0 }}>
          <div>
            <h1 className="h1">Your profile</h1>
            <p className="p">Help nearby cyclists understand your style and preferences.</p>
          </div>
          <span className="badge badgePrimary">{status === "authed" ? "Signed in" : "Guest"}</span>
        </div>

        <div className="stack">
          <div>
            <div className="label">Display name</div>
            <input
              className="input"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              placeholder="e.g. Alex"
            />
          </div>

          <div>
            <div className="label">Bio</div>
            <textarea
              className="textarea"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="What kind of rides do you love?"
            />
          </div>

          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="label">Pace</div>
              <select
                className="select"
                value={profile.pace}
                onChange={(e) => setProfile({ ...profile, pace: e.target.value })}
              >
                <option value="casual">Casual</option>
                <option value="steady">Steady</option>
                <option value="fast">Fast</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <div className="label">Bike type</div>
              <select
                className="select"
                value={profile.bike_type}
                onChange={(e) => setProfile({ ...profile, bike_type: e.target.value })}
              >
                <option value="road">Road</option>
                <option value="gravel">Gravel</option>
                <option value="mtb">MTB</option>
                <option value="commuter">Commuter</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="label">Looking for</div>
              <select
                className="select"
                value={profile.looking_for}
                onChange={(e) => setProfile({ ...profile, looking_for: e.target.value })}
              >
                <option value="friends">Friends</option>
                <option value="training">Training partners</option>
                <option value="commute">Commute buddies</option>
                <option value="group_rides">Group rides</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <div className="label">Home base (approx.)</div>
              <input
                className="input"
                value={profile.home_base}
                onChange={(e) => setProfile({ ...profile, home_base: e.target.value })}
                placeholder="Neighborhood / City"
              />
            </div>
          </div>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn btnPrimary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        {toast && (
          <div
            className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`}
            role="status"
          >
            {toast.message}
          </div>
        )}
      </section>

      <aside className="card">
        <h2 className="cardTitle">Visibility</h2>
        <p className="p">
          Nearby search will use your approximate location once enabled on the backend. For now, this is a UI-first
          implementation.
        </p>

        <div className="divider" />

        <div className="stack">
          <div className="badge">Editable fields • safe defaults</div>
          <div className="badge">Works offline • API-ready</div>
          <div className="badge">Designed for mobile and desktop</div>
        </div>
      </aside>
    </div>
  );
}
