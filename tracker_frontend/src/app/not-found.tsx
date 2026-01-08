import React from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";

export default function NotFound() {
  return (
    <div className="appShell">
      <AppHeader />
      <main style={{ padding: 16, display: "grid", placeItems: "center" }}>
        <section className="card" role="alert" aria-live="assertive" style={{ width: "min(560px, 100%)" }}>
          <header className="cardHeader">
            <h1 className="cardTitle">404 – Page Not Found</h1>
            <p className="small muted" style={{ marginTop: 6 }}>
              The page you’re looking for doesn’t exist.
            </p>
          </header>
          <div className="cardBody">
            <Link className="btn btnPrimary" href="/">
              Back to dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
