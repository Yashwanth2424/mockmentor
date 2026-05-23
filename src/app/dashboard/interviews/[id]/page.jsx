"use client";

import {
      useParams,
      useRouter,
} from "next/navigation";

import useSWR from "swr";

import {
      ArrowLeft,
      Calendar,
      CheckCircle,
      Clock,
      User,
      Mail,
      XCircle,
} from "lucide-react";

import "./details.css";

export default function InterviewDetailsPage() {

      const { id } =
            useParams();

      const router =
            useRouter();

      // FETCHER

      const fetcher = async (url) => {

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
                        "Failed to fetch interview"
                  );
            }

            return json.data;
      };

      // SWR

      const {
            data,
            isLoading,
            error,
      } = useSWR(
            id
                  ? `/api/interviews/${id}`
                  : null,
            fetcher,
            {
                  revalidateOnFocus: false,
            }
      );

      // SAFE DATA

      const interview =
            data || null;

      // LOADING

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

      // ERROR

      if (error || !interview) {

            return (
                  <div className="details-container">

                        <button
                              className="back-btn"
                              onClick={() =>
                                    router.push(
                                          "/dashboard/interviews"
                                    )
                              }
                        >

                              <ArrowLeft size={18} />

                              Back
                        </button>

                        <div className="details-card">

                              <h2 className="title">
                                    Interview not found
                              </h2>

                              <p className="no-feedback">
                                    Please refresh the page or try again later.
                              </p>
                        </div>
                  </div>
            );
      }

      // STATUS ICON

      function renderStatusIcon() {

            switch (
            interview.status
            ) {

                  case "COMPLETED":
                  case "ACCEPTED":

                        return (
                              <CheckCircle size={18} />
                        );

                  case "REJECTED":
                  case "CANCELLED":

                        return (
                              <XCircle size={18} />
                        );

                  default:

                        return (
                              <Clock size={18} />
                        );
            }
      }

      // FEEDBACK MESSAGE

      function renderFeedbackMessage() {

            switch (
            interview.status
            ) {

                  case "PENDING":

                        return (
                              "Interview feedback will appear after completion."
                        );

                  case "ACCEPTED":

                        return (
                              "Feedback will be added after the interview is completed."
                        );

                  case "REJECTED":

                        return (
                              "This interview was rejected by the mentor."
                        );

                  case "CANCELLED":

                        return (
                              "This interview was cancelled."
                        );

                  default:

                        return (
                              "No feedback has been added yet."
                        );
            }
      }

      return (
            <div className="details-container fade-in">

                  {/* BACK BUTTON */}

                  <button
                        className="back-btn"
                        onClick={() =>
                              router.push(
                                    "/dashboard/interviews"
                              )
                        }
                  >

                        <ArrowLeft size={18} />

                        Back to Interviews
                  </button>

                  {/* CARD */}

                  <div className="details-card hover-card">

                        {/* HEADER */}

                        <div className="details-header">

                              <h1 className="title">
                                    {interview.topic}
                              </h1>

                              <span
                                    className={`status ${interview.status?.toLowerCase()}`}
                              >
                                    {interview.status}
                              </span>
                        </div>

                        {/* INFO GRID */}

                        <div className="info-grid">

                              {/* DATE */}

                              <div className="info-card">

                                    <div className="info-label">

                                          <Calendar size={16} />

                                          Interview Date
                                    </div>

                                    <div className="info-value">

                                          {interview.date
                                                ? new Date(
                                                      interview.date
                                                ).toLocaleString()
                                                : "N/A"}
                                    </div>
                              </div>

                              {/* STATUS */}

                              <div className="info-card">

                                    <div className="info-label">

                                          {renderStatusIcon()}

                                          Current Status
                                    </div>

                                    <div className="info-value">

                                          {interview.status}
                                    </div>
                              </div>

                              {/* MENTOR */}

                              <div className="info-card">

                                    <div className="info-label">

                                          <User size={16} />

                                          Mentor
                                    </div>

                                    <div className="info-value">

                                          {interview.mentor?.name ||
                                                "Not Assigned"}
                                    </div>
                              </div>

                              {/* EMAIL */}

                              <div className="info-card">

                                    <div className="info-label">

                                          <Mail size={16} />

                                          Mentor Email
                                    </div>

                                    <div className="info-value">

                                          {interview.mentor?.email ||
                                                "N/A"}
                                    </div>
                              </div>
                        </div>

                        {/* FEEDBACK */}

                        <div className="feedback-box">

                              <h3>
                                    Mentor Feedback
                              </h3>

                              {interview.feedback ? (

                                    <div className="feedback-content">

                                          {/* RATING */}

                                          <div className="feedback-rating">

                                                <span>
                                                      Rating:
                                                </span>

                                                <div className="stars">

                                                      {"★".repeat(
                                                            Number(
                                                                  interview.rating
                                                            ) || 0
                                                      )}
                                                </div>
                                          </div>

                                          {/* STRENGTHS */}

                                          {interview.strengths && (

                                                <div className="feedback-section">

                                                      <h4>
                                                            Strengths
                                                      </h4>

                                                      <p>
                                                            {interview.strengths}
                                                      </p>
                                                </div>
                                          )}

                                          {/* IMPROVEMENTS */}

                                          {interview.improvements && (

                                                <div className="feedback-section">

                                                      <h4>
                                                            Areas to Improve
                                                      </h4>

                                                      <p>
                                                            {interview.improvements}
                                                      </p>
                                                </div>
                                          )}

                                          {/* OVERALL */}

                                          <div className="feedback-section">

                                                <h4>
                                                      Overall Feedback
                                                </h4>

                                                <p>
                                                      {interview.feedback}
                                                </p>
                                          </div>
                                    </div>

                              ) : (

                                    <p className="no-feedback">

                                          {renderFeedbackMessage()}
                                    </p>
                              )}
                        </div>
                  </div>
            </div>
      );
}