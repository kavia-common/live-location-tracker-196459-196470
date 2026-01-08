import React from "react";
import type { Device } from "@/lib/api";

type Props = {
  devices: Device[];
  activeDeviceId: string | null;
  onSelectDevice: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
};

// PUBLIC_INTERFACE
export default function DeviceSidebar({
  devices,
  activeDeviceId,
  onSelectDevice,
  isLoading,
  error,
}: Props) {
  /** Sidebar listing devices and allowing selection for map tracking. */
  return (
    <aside className="card" aria-label="Devices">
      <div className="cardHeader">
        <div className="helperRow">
          <div className="cardTitle">Devices</div>
          <span className="pill">{devices.length}</span>
        </div>
        <div className="small muted" style={{ marginTop: 6 }}>
          Pick a device to start live tracking.
        </div>
      </div>

      <div className="cardBody">
        {isLoading ? <div className="small muted">Loading devices…</div> : null}
        {error ? <div className="alert">Device list error: {error}</div> : null}

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {devices.length === 0 && !isLoading ? (
            <div className="small muted">
              No devices found. (If backend API differs, update <span className="kbd">/devices</span>.)
            </div>
          ) : null}

          {devices.map((d) => {
            const isActive = d.id === activeDeviceId;
            return (
              <button
                key={d.id}
                type="button"
                className={`btn ${isActive ? "btnPrimary" : ""}`}
                onClick={() => onSelectDevice(d.id)}
                aria-pressed={isActive}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <span>
                  <span style={{ display: "block", fontWeight: 650 }}>{d.name}</span>
                  <span className="small" style={{ opacity: 0.8 }}>
                    id: {d.id}
                  </span>
                </span>
                <span className="pill" style={{ background: "rgba(245, 158, 11, 0.10)", borderColor: "rgba(245, 158, 11, 0.25)", color: "rgba(146, 64, 14, 1)" }}>
                  {d.status ?? "unknown"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
