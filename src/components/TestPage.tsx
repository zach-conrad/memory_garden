/**
* 
* Displays the application's production health check dashboard.
*
* Provides authorized testers and administrators with a live view of application
* health, allowing them to monitor system status and run
* diagnostic checks.
* @packageDocumentation
*/

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";
import { runHealthChecks, type CheckResult } from "../lib/healthChecks";
import { LoadingScreen } from "./LoadingScreen";

const REFRESH_INTERVAL_S = 60;

/** Live production health-check dashboard, gated to admins and testers. */
export function TestPage() {
  const { user } = useAuth();
  const { canAccessTests, loading: checkingRole } = useUserRole();
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [secondsUntilNext, setSecondsUntilNext] = useState(REFRESH_INTERVAL_S);

  const run = useCallback(async () => {
    if (!user) return;
    setRunning(true);
    const next = await runHealthChecks(user.id);
    setResults(next);
    setLastRun(new Date());
    setRunning(false);
    setSecondsUntilNext(REFRESH_INTERVAL_S);
  }, [user]);

  useEffect(() => {
    if (!canAccessTests || !user) return;
    run();
    const interval = setInterval(run, REFRESH_INTERVAL_S * 1000);
    return () => clearInterval(interval);
  }, [canAccessTests, user, run]);

  useEffect(() => {
    if (!canAccessTests) return;
    const tick = setInterval(() => {
      setSecondsUntilNext((s) => (s <= 1 ? REFRESH_INTERVAL_S : s - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [canAccessTests]);

  if (checkingRole) return <LoadingScreen />;

  if (!canAccessTests) {
    return (
      <div className="restricted">
        <div className="restricted__card">
          <span className="restricted__icon" aria-hidden="true">
            🔒
          </span>
          <h1>This patch is off-limits</h1>
          <p>You don&rsquo;t have tester or admin access, so there&rsquo;s nothing to check here.</p>
          <a className="btn btn--primary" href="/">
            Back to the garden
          </a>
        </div>
      </div>
    );
  }

  const failing = results.filter((r) => r.status === "fail").length;
  const overall = results.length === 0 ? "pending" : failing === 0 ? "ok" : "bad";

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">Diagnostics</p>
          <h1>Production health checks</h1>
        </div>
        <a className="admin-page__back" href="/">
          ← Back to the garden
        </a>
      </header>

      <div className="test-page__summary">
        <span className={`test-page__status test-page__status--${overall}`}>
          {results.length === 0
            ? "Running first check…"
            : failing === 0
              ? "All systems normal"
              : `${failing} ${failing === 1 ? "check" : "checks"} failing`}
        </span>
        <span className="test-page__meta">
          {lastRun && `Last run ${lastRun.toLocaleTimeString()} · `}
          {running ? "Running…" : `Next run in ${secondsUntilNext}s`}
        </span>
        <button type="button" className="btn" onClick={run} disabled={running}>
          {running ? "Running…" : "Run now"}
        </button>
      </div>

      <ul className="test-page__list">
        {results.map((r) => (
          <li key={r.name} className={`test-page__item test-page__item--${r.status}`}>
            <span className="test-page__icon" aria-hidden="true">
              {r.status === "pass" ? "✓" : "✗"}
            </span>
            <div className="test-page__item-body">
              <p className="test-page__name">{r.name}</p>
              <p className="test-page__detail">{r.detail}</p>
            </div>
            <span className="test-page__duration">{r.durationMs}ms</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
