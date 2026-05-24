"use client";

import { useEffect } from "react";
import "../error.css";
// import "./dashboard-error.css";

export default function DashboardError({ error, reset }) {

      useEffect(() => {
            console.error("Dashboard error:", error);
      }, [error]);

      return (
            <div className="error-container">
                  <div className="error-card">
                        <div className="error-icon">!</div>
                        <h1 className="error-title">Dashboard Error</h1>
                        <p className="error-message">
                              Failed to load your dashboard. Your data is safe.
                        </p>
                        <div className="error-actions">
                              <button className="error-btn primary" onClick={reset}>
                                    Try Again
                              </button>
                              <a className="error-btn secondary" href="/dashboard">
                                    Reload Dashboard
                              </a>
                        </div>
                  </div>
            </div>
      );
}