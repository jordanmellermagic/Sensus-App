import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";
import { fetchDataPeek, clearDataPeek } from "../api.js";
import { parseBirthday, formatBirthdayDisplay, getZodiacSign, getDaysAlive, getDayOfWeek } from "../birthdayUtils.js";

const POLL_MS = 1500;

export default function SpectatorDataPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchDataPeek(userId);
        if (cancelled) return;
        setData(res);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load");
        setLoading(false);
      }
    }

    load();
    const id = setInterval(load, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [userId]);

  async function handleClear() {
    try {
      await clearDataPeek(userId);
      setData(null);
    } catch (err) {
      setError(err.message || "Failed to clear");
    }
  }

  const birthdayParsed = data?.birthday ? parseBirthday(data.birthday) : null;
  const birthdayDisplay = birthdayParsed ? formatBirthdayDisplay(birthdayParsed) : "-";
  const zodiac = birthdayParsed ? getZodiacSign(birthdayParsed.month, birthdayParsed.day) : null;
  const daysAlive = birthdayParsed ? getDaysAlive(birthdayParsed) : null;
  const dayOfWeek = birthdayParsed ? getDayOfWeek(birthdayParsed) : null;

  const hasFullDate = !!birthdayParsed?.year;

  return (
    <div className="spectator-shell">
      <div className="spectator-header-row">
        <div className="back-link" onClick={() => navigate("/dashboard")}>
          ← Home
        </div>
        <div className="spectator-clear" onClick={handleClear}>
          Clear
        </div>
      </div>

      <div className="spectator-title">Spectator Data</div>

      <div className="spectator-content">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <>
            <div className="spectator-label">Full Name</div>
            <div className="spectator-value">
              {data?.first_name || data?.last_name
                ? `${data.first_name || ""} ${data.last_name || ""}`.trim()
                : "—"}
            </div>

            <div className="spectator-label">Phone Number</div>
            <div className="spectator-value">{data?.phone_number || "—"}</div>

            <div className="spectator-label">Birthday</div>
            <div className="spectator-value">{data?.birthday ? birthdayDisplay : "—"}</div>

            {birthdayParsed && (
              <>
                <div
                  className="toggle-link"
                  onClick={() => setShowDetails((v) => !v)}
                >
                  {showDetails ? "Hide details" : "Show details"}
                </div>
                {showDetails && (
                  <div style={{ marginTop: 8 }}>
                    {zodiac && <div>Star sign: {zodiac}</div>}
                    {hasFullDate && daysAlive != null && (
                      <div>Days alive: {daysAlive.toLocaleString()}</div>
                    )}
                    {hasFullDate && dayOfWeek && (
                      <div>Day of week born: {dayOfWeek}</div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="spectator-label">Address</div>
            <div className="spectator-value">
              {data?.address && data.address.trim().length > 0 ? data.address : "No address on file."}
            </div>
          </>
        )}
        {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
