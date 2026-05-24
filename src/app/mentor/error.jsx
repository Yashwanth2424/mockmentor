"use client";

import { useEffect } from "react";
import "../error.css";

export default function MentorError({ error, reset }) {

      useEffect(() => {
            console.error("Mentor error:", error);
      }, [error]);

      return (
            <div className="error-container">
                  <div className="error-card">
                        <div className="error-icon">!</div>
                        <h1 className="error-title">Mentor Dashboard Error</h1>
                        <p className="error-message">
                              Failed to load the mentor dashboard. Please try again.
                        </p>
                        <div className="error-actions">
                              <button className="error-btn primary" onClick={reset}>
                                    Try Again
                              </button>
                              <a className="error-btn secondary" href="/mentor">
                                    Reload Dashboard
                              </a>
                        </div>
                  </div>
            </div>
      );
}