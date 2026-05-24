"use client";

import { useEffect } from "react";
import "../error.css";

export default function AdminError({ error, reset }) {

      useEffect(() => {
            console.error("Admin error:", error);
      }, [error]);

      return (
            <div className="error-container">
                  <div className="error-card">
                        <div className="error-icon">!</div>
                        <h1 className="error-title">Admin Panel Error</h1>
                        <p className="error-message">
                              Something went wrong in the admin panel. Please try again.
                        </p>
                        <div className="error-actions">
                              <button className="error-btn primary" onClick={reset}>
                                    Try Again
                              </button>
                              <a className="error-btn secondary" href="/admin">
                                    Reload Panel
                              </a>
                        </div>
                  </div>
            </div>
      );
}