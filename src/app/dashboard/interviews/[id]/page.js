"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import useSWR from "swr";
import "./details.css";

export default function InterviewDetailsPage() {

      const { id } = useParams();
      const router = useRouter();

      const fetcher = (url) => fetch(url).then(res => res.json());

      // 🔥 SWR
      const {
            data,
            isLoading
      } = useSWR(
            id ? `/api/interviews/${id}` : null,
            fetcher,
            {
                  revalidateOnFocus: false
            }
      );

      // ✅ Safe interview object
      const interview = data && !data.error ? data : null;

      // ======================
      // Loading state
      // ======================
      if (isLoading) {
            return (
                  <div className="details-container">
                        <div className="skeleton skeleton-back"></div>

                        <div className="details-card">
                              <div className="skeleton skeleton-title"></div>

                              <div className="skeleton skeleton-line"></div>
                              <div className="skeleton skeleton-line"></div>

                              <div className="feedback-box">
                                    <div className="skeleton skeleton-subtitle"></div>
                                    <div className="skeleton skeleton-text"></div>
                                    <div className="skeleton skeleton-text short"></div>
                              </div>
                        </div>
                  </div>
            );
      }

      // ======================
      // Error state
      // ======================
      if (!interview) {
            return (
                  <div style={{ padding: 40 }}>
                        <h2>Interview not found</h2>
                        <button onClick={() => router.push("/dashboard")}>
                              Back to Dashboard
                        </button>
                  </div>
            );
      }

      return (
            <div className="details-container fade-in">

                  {/*  Back Button */}
                  <button
                        className="back-btn"
                        onClick={() => router.push("/dashboard")}
                  >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                  </button>

                  <div className="details-card hover-card">

                        <h1 className="title">{interview.topic}</h1>

                        <div className="info">

                              {/*  Date */}
                              <p className="info-item">
                                    <Calendar size={18} />
                                    <span>
                                          {interview.date
                                                ? new Date(interview.date).toLocaleString()
                                                : "N/A"}
                                    </span>
                              </p>

                              {/*  Status */}
                              <p className="info-item">
                                    {interview.status === "COMPLETED" && <CheckCircle size={18} />}
                                    {interview.status === "PENDING" && <Clock size={18} />}
                                    {interview.status === "CANCELLED" && <XCircle size={18} />}

                                    <span className={`status ${interview.status?.toLowerCase()}`}>
                                          {interview.status || "PENDING"}
                                    </span>
                              </p>

                        </div>

                        {/*  Feedback */}
                        <div className="feedback-box">

                              <h3>Admin Feedback</h3>

                              {interview.feedback ? (
                                    <p>{interview.feedback}</p>
                              ) : (
                                    <p className="no-feedback">No feedback yet</p>
                              )}

                        </div>

                  </div>
            </div>
      );
}