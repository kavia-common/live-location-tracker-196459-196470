"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import DeviceSidebar from "@/components/DeviceSidebar";
import MapView from "@/components/MapView";
import type { Device, LocationPoint } from "@/lib/api";
import { getLatestLocation, listDevices } from "@/lib/api";
import { clearStoredToken, getStoredToken } from "@/lib/auth";

type LoadState = "idle" | "loading" | "ready" | "error";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  const [devicesState, setDevicesState] = useState<LoadState>("idle");
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  const [locationState, setLocationState] = useState<LoadState>("idle");
  const [location, setLocation] = useState<LocationPoint | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [isLive, setIsLive] = useState(true);

  // Prevent overlapping polling calls
  const inFlight = useRef(false);

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  // Initial load: devices
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setDevicesState("loading");
      setDevicesError(null);

      const res = await listDevices(token ?? undefined);

      if (cancelled) return;

      if (!res.ok) {
        setDevicesState("error");
        setDevicesError(res.error);
        setDevices([]);
        return;
      }

      setDevicesState("ready");
      setDevices(res.data);

      // Auto-select first device if none selected yet
      if (!activeDeviceId && res.data.length > 0) {
        setActiveDeviceId(res.data[0].id);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Polling: latest location for active device
  useEffect(() => {
    if (!activeDeviceId) return;

    // Capture a non-null device id for this effect instance to satisfy TS narrowing.
    const deviceId = activeDeviceId;

    let cancelled = false;
    let timer: number | null = null;

    async function tick() {
      if (!isLive || cancelled) return;
      if (inFlight.current) return;

      inFlight.current = true;
      setLocationState((s) => (s === "idle" ? "loading" : s));
      setLocationError(null);

      const res = await getLatestLocation(deviceId, token ?? undefined);

      if (!cancelled) {
        if (!res.ok) {
          setLocationState("error");
          setLocationError(res.error);
        } else {
          setLocationState("ready");
          setLocation(res.data);
        }
      }

      inFlight.current = false;
      if (!cancelled) {
        timer = window.setTimeout(tick, 2000);
      }
    }

    tick();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [activeDeviceId, isLive, token]);

  const activeDeviceName = useMemo(() => {
    const d = devices.find((x) => x.id === activeDeviceId);
    return d?.name;
  }, [devices, activeDeviceId]);

  return (
    <div className="appShell">
      <AppHeader
        right={
          <>
            <Link className="btn" href="/auth">
              Login / Register
            </Link>
            <button
              className="btn btnDanger"
              type="button"
              onClick={() => {
                clearStoredToken();
                setToken(null);
              }}
              title="Clear local token"
            >
              Sign out
            </button>
          </>
        }
      />

      <main className="mainGrid" aria-label="Dashboard">
        <DeviceSidebar
          devices={devices}
          activeDeviceId={activeDeviceId}
          onSelectDevice={(id) => {
            setActiveDeviceId(id);
            setLocation(null);
            setLocationState("idle");
            setLocationError(null);
          }}
          isLoading={devicesState === "loading"}
          error={devicesError}
        />

        <div style={{ display: "grid", gap: 16 }}>
          <section className="card" aria-label="Controls">
            <div className="cardBody">
              <div className="helperRow">
                <div>
                  <div style={{ fontWeight: 650 }}>Live tracking</div>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    Updates via API polling (2s). If websockets exist in backend, this can be upgraded later.
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className={`btn ${isLive ? "btnPrimary" : ""}`} type="button" onClick={() => setIsLive(true)}>
                    Live
                  </button>
                  <button className={`btn ${!isLive ? "btnPrimary" : ""}`} type="button" onClick={() => setIsLive(false)}>
                    Pause
                  </button>
                </div>
              </div>

              <div className="small muted" style={{ marginTop: 10 }}>
                Auth token:{" "}
                {token ? (
                  <>
                    <span className="pill">present</span> <span className="muted">(sent as Bearer when provided)</span>
                  </>
                ) : (
                  <>
                    <span className="pill" style={{ background: "rgba(17,24,39,0.04)", borderColor: "rgba(17,24,39,0.10)", color: "rgba(17,24,39,0.75)" }}>
                      none
                    </span>{" "}
                    <span className="muted">— you can still try public endpoints</span>
                  </>
                )}
              </div>

              {locationState === "error" ? (
                <div className="alert" role="alert" aria-live="assertive" style={{ marginTop: 12 }}>
                  Location feed error (verify backend endpoints).{" "}
                  <span className="small">
                    Expected <span className="kbd">GET /locations/latest?device_id=…</span>
                  </span>
                </div>
              ) : null}
            </div>
          </section>

          <MapView activeDeviceName={activeDeviceName} location={location} isLive={isLive} error={locationError} />
        </div>
      </main>
    </div>
  );
}
