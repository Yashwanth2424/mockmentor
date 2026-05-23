"use client";

import Link from "next/link";

import useSWR from "swr";

import {
      Calendar,
      Clock,
      CheckCircle,
      XCircle,
      ArrowRight,
} from "lucide-react";

import SkeletonDashboard
      from "@/components/skeletons/SkeletonDashboard";

import "./dashboard.css";

export default function DashboardPage() {

      // FETCHER

      const fetcher =
            async (url) => {

                  const res =
                        await fetch(url);

                  const json =
                        await res.json();

                  if (
                        !res.ok ||
                        !json.success
                  ) {

                        throw new Error(
                              json.error ||
                              "Failed to fetch dashboard data"
                        );
                  }

                  return Array.isArray(
                        json.data
                  )
                        ? json.data
                        : [];
            };

      // INTERVIEWS

      const {
            data: interviews = [],
            isLoading,
            error,
      } = useSWR(
            "/api/interviews",
            fetcher,
            {
                  revalidateOnFocus: false,
            }
      );

      // SAFE DATA

      const safeInterviews =
            Array.isArray(
                  interviews
            )
                  ? interviews
                  : [];

      // LOADING

      if (isLoading) {

            return (
                  <SkeletonDashboard />
            );
      }

      // ERROR

      if (error) {

            return (
                  <section className="dashboard-page">

                        <div className="empty-dashboard">

                              <h3>
                                    Failed to load dashboard
                              </h3>

                              <p>
                                    Please refresh the page and try again.
                              </p>
                        </div>
                  </section>
            );
      }

      // STATS

      const totalInterviews =
            safeInterviews.length;

      const pendingInterviews =
            safeInterviews.filter(
                  (interview) =>
                        interview.status ===
                        "PENDING"
            ).length;

      const completedInterviews =
            safeInterviews.filter(
                  (interview) =>
                        interview.status ===
                        "COMPLETED"
            ).length;

      const cancelledInterviews =
            safeInterviews.filter(
                  (interview) =>
                        interview.status ===
                        "CANCELLED"
            ).length;

      // RECENT INTERVIEWS

      const recentInterviews =
            [...safeInterviews]
                  .sort(
                        (a, b) =>
                              new Date(
                                    b.date
                              ) -
                              new Date(
                                    a.date
                              )
                  )
                  .slice(0, 5);

      return (
            <section className="dashboard-page">

                  {/* HEADER */}

                  <div className="dashboard-header">

                        <div>

                              <h1>
                                    Dashboard
                              </h1>

                              <p>
                                    Track your interviews and progress
                              </p>
                        </div>

                        <Link
                              href="/dashboard/book"
                              className="dashboard-book-btn"
                        >
                              Book Interview
                        </Link>
                  </div>

                  {/* STATS */}

                  <div className="stats-grid">

                        {/* TOTAL */}

                        <div className="stats-card">

                              <div className="stats-icon total-icon">
                                    <Calendar size={20} />
                              </div>

                              <div>

                                    <p className="stats-label">
                                          Total Interviews
                                    </p>

                                    <h2>
                                          {totalInterviews}
                                    </h2>
                              </div>
                        </div>

                        {/* PENDING */}

                        <div className="stats-card">

                              <div className="stats-icon pending-icon">
                                    <Clock size={20} />
                              </div>

                              <div>

                                    <p className="stats-label">
                                          Pending
                                    </p>

                                    <h2>
                                          {pendingInterviews}
                                    </h2>
                              </div>
                        </div>

                        {/* COMPLETED */}

                        <div className="stats-card">

                              <div className="stats-icon completed-icon">
                                    <CheckCircle size={20} />
                              </div>

                              <div>

                                    <p className="stats-label">
                                          Completed
                                    </p>

                                    <h2>
                                          {completedInterviews}
                                    </h2>
                              </div>
                        </div>

                        {/* CANCELLED */}

                        <div className="stats-card">

                              <div className="stats-icon cancelled-icon">
                                    <XCircle size={20} />
                              </div>

                              <div>

                                    <p className="stats-label">
                                          Cancelled
                                    </p>

                                    <h2>
                                          {cancelledInterviews}
                                    </h2>
                              </div>
                        </div>
                  </div>

                  {/* RECENT */}

                  <div className="recent-section">

                        <div className="section-header">

                              <h2>
                                    Recent Interviews
                              </h2>

                              <Link
                                    href="/dashboard/interviews"
                                    className="view-all-link"
                              >
                                    View All

                                    <ArrowRight size={16} />
                              </Link>
                        </div>

                        {recentInterviews.length === 0 ? (

                              <div className="empty-dashboard">

                                    <h3>
                                          No interviews yet
                                    </h3>

                                    <p>
                                          Start by booking your first mock interview.
                                    </p>
                              </div>

                        ) : (

                              <div className="recent-list">

                                    {recentInterviews.map(
                                          (interview) => (

                                                <div
                                                      key={
                                                            interview.id
                                                      }
                                                      className="recent-card"
                                                >

                                                      <div>

                                                            <h3>
                                                                  {
                                                                        interview.topic
                                                                  }
                                                            </h3>

                                                            <p>
                                                                  {new Date(
                                                                        interview.date
                                                                  ).toLocaleString()}
                                                            </p>

                                                            <span
                                                                  className={`dashboard-status status-${interview.status?.toLowerCase()}`}
                                                            >
                                                                  {
                                                                        interview.status
                                                                  }
                                                            </span>
                                                      </div>

                                                      <Link
                                                            href={`/dashboard/interviews/${interview.id}`}
                                                            className="details-link"
                                                      >
                                                            Details
                                                      </Link>
                                                </div>
                                          )
                                    )}
                              </div>
                        )}
                  </div>
            </section>
      );
}