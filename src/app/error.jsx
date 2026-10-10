"use client";

import Link from "next/link";
import { useEffect } from "react";
import "./error.css";

export default function GlobalError({ error, reset }) {

      useEffect(() => {
            console.error("Global error:", error);
      }, [error]);

      return (
            <div className="error-container">
                  <div className="error-card">
                        <div className="error-icon">!</div>
                        <h1 className="error-title">Something went wrong</h1>
                        <p className="error-message">
                              An unexpected error occurred. Please try again.
                        </p>
                        <div className="error-actions">
                              <button className="error-btn primary" onClick={reset}>
                                    Try Again
                              </button>
                              <Link className="error-btn secondary" href="/">
                                    Go Home
                              </Link>
                        </div>
                  </div>
            </div>
      );
}