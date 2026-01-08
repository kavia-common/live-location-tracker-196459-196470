import React from "react";
import type { LocationPoint } from "@/lib/api";

type Props = {
  activeDeviceName?: string;
  location?: LocationPoint | null;
  isLive?: boolean;
  error?: string | null;
};

// PUBLIC_INTERFACE
export default function MapView({ activeDeviceName, location, isLive, error }: Props) {
  /**
   * Dependency-free "interactive map view" placeholder:
   * - renders a grid background resembling a map
   * - places a marker based on lat/lng (normalized into container)
   *
   * TODO: Replace with a real map provider (Mapbox/Leaflet/Google) if desired.
   */
  const normalized = normalizeLatLng(location?.lat, location?.lng);

  return (
    <section className="card" aria-label="Map">
      <div className="cardHeader">
        <div className="helperRow">
          <div className="cardTitle">Map</div>
          <div className="pill" aria-live="polite">
            {isLive ? "Live" : "Paused"}
          </div>
        </div>
        <div className="small muted" style={{ marginTop: 6 }}>
          {activeDeviceName ? (
            <>
              Tracking: <strong>{activeDeviceName}</strong>
            </>
          ) : (
            "Select a device to view live location"
          )}
        </div>
      </div>

      <div className="cardBody">
        {error ? <div className="alert">Map feed error: {error}</div> : null}

        <div className="mapWrap" role="img" aria-label="Map placeholder with device marker">
          <div className="mapGrid" aria-hidden="true" />
          <div className="mapHud" aria-hidden="false">
            <span className="pill">Backend: :3001</span>
            <span className="kbd">poll</span>
            <span className="small muted">every 2s</span>
          </div>

          {location ? (
            <>
              <div
                className="marker"
                style={{
                  left: `${normalized.x * 100}%`,
                  top: `${normalized.y * 100}%`,
                }}
                aria-label="Device marker"
              />
              <div
                className="card"
                style={{
                  position: "absolute",
                  left: "14px",
                  bottom: "14px",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  maxWidth: "360px",
                }}
                aria-live="polite"
              >
                <div className="small">
                  <strong>Latest fix</strong>
                </div>
                <div className="small muted" style={{ marginTop: 4 }}>
                  lat: {location.lat.toFixed(6)} · lng: {location.lng.toFixed(6)}
                </div>
                {location.ts ? (
                  <div className="small muted" style={{ marginTop: 2 }}>
                    ts: {location.ts}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div
              className="card"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                padding: "12px 14px",
                borderRadius: "12px",
              }}
              aria-live="polite"
            >
              <div className="small muted">No location loaded yet.</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function normalizeLatLng(lat?: number, lng?: number): { x: number; y: number } {
  // Fallback center
  if (typeof lat !== "number" || typeof lng !== "number") return { x: 0.5, y: 0.5 };

  // Map lat/lng into [0..1] range (very rough) to place marker on placeholder.
  // Longitude: [-180..180] -> [0..1]
  const x = (lng + 180) / 360;

  // Latitude: [90..-90] -> [0..1] (invert so north is top)
  const y = (90 - lat) / 180;

  // Clamp
  return {
    x: Math.max(0.02, Math.min(0.98, x)),
    y: Math.max(0.02, Math.min(0.98, y)),
  };
}
