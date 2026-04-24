"use client";

import SkeletonDetails from "@/components/skeletons/SkeletonDetails";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "react-toastify";
import "./details.css";

export default function InterviewDetails() {

      const { id } = useParams();
      const router = useRouter();

      const fetcher = (url) => fetch(url).then(res => res.json());

      const {
            data,
            isLoading,
            mutate
      } = useSWR(
            id ? `/api/admin/interviews/${id}` : null,
            fetcher,
            {
                  revalidateOnFocus: false
            }
      );

      const interview = data && !data.error ? data : null;

      const [feedback, setFeedback] = useState("");
      const [date, setDate] = useState("");
      const [loadingAction, setLoadingAction] = useState(false);

      useEffect(() => {
            if (interview) {
                  setFeedback(interview.feedback || "");
                  setDate(interview.date ? interview.date.slice(0, 16) : "");
            }
      }, [interview]);

      async function updateInterview(fields) {

            if (loadingAction) return;

            setLoadingAction(true);

            try {
                  const res = await fetch(`/api/admin/interviews/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(fields),
                  });

                  const result = await res.json();

                  if (!res.ok) {
                        toast.error(result.error || "Update failed");
                        return;
                  }

                  toast.success("Updated successfully");

                  mutate();

                  setTimeout(() => {
                        router.push("/admin");
                  }, 800);

            } catch (err) {
                  toast.error("Server error");
            } finally {
                  setLoadingAction(false);
            }
      }

      if (isLoading) return <SkeletonDetails />;

      if (!interview) {
            return (
                  <div style={{ padding: 40 }}>
                        <h2>Interview not found</h2>
                        <button onClick={() => router.push("/admin")}>
                              Back to Admin
                        </button>
                  </div>
            );
      }

      const isCompleted = interview.status === "COMPLETED";

      return (
            <div className="details-container">

                  <button
                        className="back-btn"
                        onClick={() => router.push("/admin")}
                  >
                        ← Back to Admin
                  </button>

                  <h1>Interview Details</h1>

                  <div className="details-card">

                        <h2>{interview.topic}</h2>

                        <p>
                              <strong>Status:</strong>{" "}
                              <span className={`status ${interview.status.toLowerCase()}`}>
                                    {interview.status}
                              </span>
                        </p>

                        <p>
                              <strong>Student:</strong>{" "}
                              {interview.user?.name} ({interview.user?.email})
                        </p>

                        <p>
                              <strong>Scheduled Date:</strong>{" "}
                              {interview.date
                                    ? new Date(interview.date).toLocaleString()
                                    : "N/A"}
                        </p>

                        {/* RESCHEDULE */}
                        <div className="field">
                              <label>Reschedule</label>

                              <input
                                    type="datetime-local"
                                    value={date}
                                    disabled={isCompleted || loadingAction}
                                    onChange={(e) => setDate(e.target.value)}
                              />

                              <button
                                    disabled={isCompleted || loadingAction || !date}
                                    onClick={() => updateInterview({ date })}
                              >
                                    {loadingAction ? "Updating..." : "Update Date"}
                              </button>
                        </div>

                        {/* FEEDBACK */}
                        <div className="field">
                              <label>Feedback</label>

                              <textarea
                                    rows={4}
                                    value={feedback}
                                    disabled={loadingAction}
                                    onChange={(e) => setFeedback(e.target.value)}
                              />

                              <button
                                    disabled={loadingAction || feedback.trim() === ""}
                                    onClick={() => updateInterview({ feedback })}
                              >
                                    {loadingAction ? "Saving..." : "Save Feedback"}
                              </button>
                        </div>

                        {/* ACTIONS */}
                        <div className="actions">

                              {!isCompleted && (
                                    <button
                                          className="complete"
                                          disabled={loadingAction}
                                          onClick={() => updateInterview({ status: "COMPLETED" })}
                                    >
                                          {loadingAction ? "Updating..." : "Mark Completed"}
                                    </button>
                              )}

                              {!isCompleted && (
                                    <button
                                          className="cancel"
                                          disabled={loadingAction}
                                          onClick={() => updateInterview({ status: "CANCELLED" })}
                                    >
                                          {loadingAction ? "Updating..." : "Cancel Interview"}
                                    </button>
                              )}

                        </div>

                  </div>
            </div>
      );
}