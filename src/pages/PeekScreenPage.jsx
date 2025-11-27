import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";
import { fetchNotePeek, fetchScreenPeek, fetchScreenshotBlob, setCommand } from "../api.js";
import { summarizeUrl } from "../urlUtils.js";

const POLL_MS = 1200;
const LONG_PRESS_MS = 350;
const TAP_WINDOW_MS = 260;

function usePeekData(userId) {
  const [note, setNote] = useState({ name: "", body: "" });
  const [screen, setScreen] = useState({ contact: "", url: "", screenshotUrl: "" });
  const [hero, setHero] = useState("none"); // "note" | "url" | "screenshot" | "none"
  const lastSnapshot = useRef({ note: null, screen: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [noteRes, screenRes] = await Promise.all([
          fetchNotePeek(userId).catch(() => null),
          fetchScreenPeek(userId).catch(() => null)
        ]);

        if (cancelled) return;

        const noteData = {
          name: noteRes?.note_name || "",
          body: noteRes?.note_body || ""
        };
        const screenData = {
          contact: screenRes?.contact || "",
          url: screenRes?.url || "",
          screenshotPath: screenRes?.screenshot_path || ""
        };

        setNote(noteData);

        // only fetch screenshot blob if path present
        let screenshotUrl = "";
        if (screenData.screenshotPath) {
          const blob = await fetchScreenshotBlob(userId).catch(() => null);
          if (!cancelled && blob) {
            screenshotUrl = URL.createObjectURL(blob);
          }
        }
        setScreen({
          contact: screenData.contact,
          url: screenData.url,
          screenshotUrl
        });

        // hero selection based on what's changed since last snapshot
        const snapshot = {
          note: JSON.stringify(noteData),
          screen: JSON.stringify(screenData)
        };
        const prev = lastSnapshot.current;
        lastSnapshot.current = snapshot;

        if (!prev.note && !prev.screen) {
          // first time: prefer screenshot > url > note
          if (screenData.screenshotPath) setHero("screenshot");
          else if (screenData.url) setHero("url");
          else if (noteData.name || noteData.body) setHero("note");
          else setHero("none");
          return;
        }

        const noteChanged = snapshot.note !== prev.note;
        const screenChanged = snapshot.screen !== prev.screen;

        if (screenChanged) {
          if (screenData.screenshotPath) setHero("screenshot");
          else if (screenData.url) setHero("url");
          else if (noteChanged && (noteData.name || noteData.body)) setHero("note");
        } else if (noteChanged && (noteData.name || noteData.body)) {
          setHero("note");
        }
      } catch (_err) {
        // ignore for peek
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [userId]);

  return { note, screen, hero };
}

function vibrate(pattern) {
  if (typeof window !== "undefined" && "navigator" in window && window.navigator.vibrate) {
    window.navigator.vibrate(pattern);
  }
}

export default function PeekScreenPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { note, screen, hero } = usePeekData(userId);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const pressTimerRef = useRef(null);
  const pressStartTimeRef = useRef(0);
  const longPressActiveRef = useRef(false);
  const touchStartPositionsRef = useRef(null);

  function handleShortTap() {
    tapCountRef.current += 1;
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current);
    }
    tapTimerRef.current = window.setTimeout(() => {
      const count = tapCountRef.current;
      tapCountRef.current = 0;

      if (count === 2) {
        // double tap -> screenshot command
        setCommand(userId, "screenshot").catch(() => {});
        vibrate(40);
      } else if (count >= 3) {
        // triple tap -> finishEffect + go home
        setCommand(userId, "finishEffect").catch(() => {});
        vibrate([20, 40, 20]);
        navigate("/dashboard");
      }
    }, TAP_WINDOW_MS);
  }

  function handlePointerDown(e) {
    if (e.touches && e.touches.length === 2) {
      const [t1, t2] = e.touches;
      touchStartPositionsRef.current = {
        y1: t1.clientY,
        y2: t2.clientY
      };
    } else {
      touchStartPositionsRef.current = null;
    }

    pressStartTimeRef.current = performance.now();
    longPressActiveRef.current = false;

    pressTimerRef.current = window.setTimeout(() => {
      longPressActiveRef.current = true;
      setOverlayVisible(true);
      vibrate(60);
    }, LONG_PRESS_MS);
  }

  function handlePointerUp() {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    if (longPressActiveRef.current) {
      // end of long press
      setOverlayVisible(false);
      longPressActiveRef.current = false;
      return;
    }

    const duration = performance.now() - pressStartTimeRef.current;
    if (duration < LONG_PRESS_MS) {
      handleShortTap();
    }
  }

  function handleTouchMove(e) {
    if (!touchStartPositionsRef.current) return;
    if (!e.touches || e.touches.length !== 2) return;

    const [t1, t2] = e.touches;
    const start = touchStartPositionsRef.current;
    const dy1 = t1.clientY - start.y1;
    const dy2 = t2.clientY - start.y2;
    if (dy1 > 60 && dy2 > 60) {
      touchStartPositionsRef.current = null;
      navigate("/dashboard");
    }
  }

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
      if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    };
  }, []);

  const urlSummary = summarizeUrl(screen.url);

  const hasNote = note.name || note.body;
  const hasUrl = !!screen.url;
  const hasContact = !!screen.contact;
  const hasScreenshot = !!screen.screenshotUrl;

  return (
    <div
      className="peek-root"
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
      onTouchMove={handleTouchMove}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
    >
      {!overlayVisible && (
        <>
          <div className="peek-main-layer">
            <div className="peek-row-top">
              <div className="peek-note">
                {hasNote && (
                  <>
                    <div className="peek-note-label">Note</div>
                    <div style={{ fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {note.name || note.body}
                    </div>
                  </>
                )}
              </div>
              <div className="peek-url">
                {hasUrl && urlSummary && (
                  <div className="peek-url-host">
                    <div className="peek-url-icon" />
                    <div style={{ fontSize: 16 }}>
                      {urlSummary.host}
                      {urlSummary.searchTerm && (
                        <span style={{ display: "block", fontSize: 13, color: "#aaaaaa", marginTop: 2 }}>
                          {urlSummary.searchTerm}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="peek-contact">
                {hasContact && (
                  <>
                    <div className="peek-note-label">Contact</div>
                    <div style={{ fontSize: 16 }}>{screen.contact}</div>
                  </>
                )}
              </div>
            </div>

            <div className="peek-hero">
              {hero === "screenshot" && hasScreenshot && (
                <img src={screen.screenshotUrl} alt="Screenshot" className="peek-hero-screenshot" />
              )}
              {hero === "url" && hasUrl && (
                <div className="peek-hero-note">
                  <div style={{ fontSize: 16, marginBottom: 6 }}>{urlSummary?.host}</div>
                  {urlSummary?.searchTerm && (
                    <div style={{ fontSize: 14, color: "#cccccc" }}>{urlSummary.searchTerm}</div>
                  )}
                </div>
              )}
              {hero === "note" && hasNote && (
                <div className="peek-hero-note">
                  {note.name && <div style={{ fontSize: 16, marginBottom: 6 }}>{note.name}</div>}
                  {note.body && (
                    <div style={{ fontSize: 14, color: "#cccccc", whiteSpace: "pre-wrap" }}>{note.body}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="peek-instructions">
            Press & hold to reveal · Double-tap to screenshot · Triple-tap to finish
          </div>
        </>
      )}

      {overlayVisible && (
        <div className="peek-overlay">
          <div className="peek-overlay-content">
            {hasNote && (
              <>
                <div className="peek-note-label">Note</div>
                <div className="peek-overlay-title">{note.name || note.body}</div>
                {note.name && note.body && (
                  <div style={{ marginTop: 6 }}>{note.body}</div>
                )}
                <div style={{ height: 16 }} />
              </>
            )}

            {hasUrl && urlSummary && (
              <>
                <div className="peek-note-label">URL</div>
                <div>{urlSummary.host}</div>
                {urlSummary.searchTerm && <div style={{ marginTop: 4 }}>🔍 {urlSummary.searchTerm}</div>}
                <div style={{ height: 16 }} />
              </>
            )}

            {hasContact && (
              <>
                <div className="peek-note-label">Contact</div>
                <div>{screen.contact}</div>
                <div style={{ height: 16 }} />
              </>
            )}

            {hasScreenshot && (
              <>
                <div className="peek-note-label">Screenshot</div>
                <img
                  src={screen.screenshotUrl}
                  alt="Screenshot"
                  style={{
                    marginTop: 8,
                    maxWidth: "80%",
                    maxHeight: "60vh",
                    borderRadius: 16,
                    border: "1px solid #333"
                  }}
                />
              </>
            )}

            {!hasNote && !hasUrl && !hasContact && !hasScreenshot && (
              <div style={{ marginTop: 40, fontSize: 16, color: "#777" }}>
                Waiting for data from shortcut…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
