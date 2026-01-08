"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { login, register } from "@/lib/api";
import { setStoredToken } from "@/lib/auth";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const title = useMemo(() => (mode === "login" ? "Sign in" : "Create account"), [mode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter an email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = mode === "login" ? await login(email.trim(), password) : await register(email.trim(), password);

      if (!res.ok) {
        setError(res.error || "Authentication failed.");
        return;
      }

      if (res.data.token) {
        setStoredToken(res.data.token);
        setNotice("Success. Token stored for this session. Return to dashboard.");
      } else {
        // Some backends return no token on register.
        setNotice("Account created. Now sign in to obtain a token.");
        setMode("login");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="appShell">
      <AppHeader
        right={
          <Link className="btn btnPrimary" href="/">
            Go to dashboard
          </Link>
        }
      />

      <main style={{ padding: 16, display: "grid", placeItems: "center" }}>
        <section className="card" style={{ width: "min(520px, 100%)" }} aria-label="Authentication">
          <header className="cardHeader">
            <div className="helperRow">
              <h1 className="cardTitle">{title}</h1>
              <div className="pill">Ocean Professional</div>
            </div>
            <p className="small muted" style={{ marginTop: 6 }}>
              Auth is wired to backend endpoints <span className="kbd">POST /auth/login</span> and{" "}
              <span className="kbd">POST /auth/register</span>. If your backend differs, update{" "}
              <span className="kbd">src/lib/api.ts</span>.
            </p>
          </header>

          <div className="cardBody">
            {error ? (
              <div className="alert" role="alert" aria-live="assertive" style={{ marginBottom: 12 }}>
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="success" role="status" aria-live="polite" style={{ marginBottom: 12 }}>
                {notice}
              </div>
            ) : null}

            <form onSubmit={onSubmit}>
              <div className="field">
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  className="input"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  className="input"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="helperRow" style={{ marginTop: 8 }}>
                <button className="btn btnPrimary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    setError(null);
                    setNotice(null);
                    setMode((m) => (m === "login" ? "register" : "login"));
                  }}
                >
                  Switch to {mode === "login" ? "Register" : "Login"}
                </button>
              </div>
            </form>

            <div className="small muted" style={{ marginTop: 14 }}>
              Tip: Tokens are stored in <span className="kbd">sessionStorage</span> for this browser tab.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
