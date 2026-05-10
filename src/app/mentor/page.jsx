"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Header from "@/components/Header/page";
import "./mentor.css";

export default function MentorPage() {
      const router = useRouter();
      const [loadingId, setLoadingId] = useState(null);
      const [user, setUser] = useState(null);
      const [filter, setFilter] = useState("ALL");
      const [feedbackModal, setFeedbackModal] = useState(null);

      const [feedbackForm, setFeedbackForm] = useState({
            rating: 5,
            feedback: "",
            strengths: "",
            improvements: "",
      });

      const [submittingFeedback, setSubmittingFeedback] = useState(false);

      const [availability, setAvailability] = useState({
            0: { start: "", end: "" },
            1: { start: "", end: "" },
            2: { start: "", end: "" },
            3: { start: "", end: "" },
            4: { start: "", end: "" },
            5: { start: "", end: "" },
            6: { start: "", end: "" },
      });

      async function saveAvailability() {
            const formatted = Object.entries(availability)
                  .filter(([_, v]) => v.start !== "" && v.end !== "")
                  .map(([day, v]) => ({
                        dayOfWeek: parseInt(day),
                        startHour: parseInt(v.start),
                        endHour: parseInt(v.end),
                  }));

            const res = await fetch("/api/mentor/availability", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ availability: formatted }),
            });

            if (res.ok) {
                  toast.success("Availability saved");
            } else {
                  toast.error("Failed");
            }
      }

      const fetcher = async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
      };

      const { data: interviews, isLoading, error, mutate } = useSWR(
            user ? "/api/mentor/interviews" : null,
            fetcher
      );

      async function handleAccept(id) {
            setLoadingId(id);

            const res = await fetch(`/api/mentor/interviews/${id}/accept`, {
                  method: "PATCH",
            });

            const data = await res.json();

            if (res.ok) {
                  toast.success("Accepted");
                  mutate();
            } else {
                  toast.error(data.error || "Failed to accept");
            }

            setLoadingId(null);
      }

      async function handleReject(id) {
            setLoadingId(id);

            const res = await fetch(`/api/mentor/interviews/${id}/reject`, {
                  method: "PATCH",
            });

            const data = await res.json();

            if (res.ok) {
                  toast.success("Rejected");
                  mutate();
            } else {
                  toast.error(data.error || "Failed to reject");
            }

            setLoadingId(null);
      }

      async function handleCompleteInterview() {

            if (!feedbackModal) return;

            try {

                  setSubmittingFeedback(true);

                  const res = await fetch(
                        `/api/mentor/interviews/${feedbackModal.id}/complete`,
                        {
                              method: "PATCH",
                              headers: {
                                    "Content-Type": "application/json",
                              },
                              body: JSON.stringify(feedbackForm),
                        }
                  );

                  const data = await res.json();

                  if (!res.ok) {
                        toast.error(data.error || "Failed");
                        return;
                  }

                  toast.success("Interview completed");

                  setFeedbackModal(null);

                  setFeedbackForm({
                        rating: 5,
                        feedback: "",
                        strengths: "",
                        improvements: "",
                  });

                  mutate();

            } catch (err) {

                  toast.error("Something went wrong");

            } finally {

                  setSubmittingFeedback(false);
            }
      }

      useEffect(() => {
            async function checkUser() {
                  try {
                        const res = await fetch("/api/me");
                        const data = await res.json();

                        if (!data || data.role !== "MENTOR") {
                              router.push("/dashboard");
                              return;
                        }

                        setUser(data);
                  } catch {
                        router.push("/login");
                  }
            }

            checkUser();
      }, [router]);

      if (!user) return <p>Loading...</p>;

      const filteredInterviews = interviews?.filter((i) => {
            if (filter === "ALL") return true;
            return i.status === filter;
      });

      return (
            <>
                  <Header user={user} />
                  <div className="mentor-container">
                        <h1 className="mentor-title">Mentor Dashboard</h1>

                        {isLoading ? (
                              <p>Loading interviews...</p>
                        ) : error ? (
                              <p style={{ color: "red" }}>Failed to load interviews</p>
                        ) : !interviews || interviews.length === 0 ? (
                              <p>No interviews assigned yet</p>
                        ) : (
                              <>

                                    <div className="availability-box">
                                          <h3>Set Weekly Availability</h3>

                                          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
                                                <div key={index} className="availability-row">
                                                      <span style={{ width: "100px" }}>{day}</span>

                                                      <select
                                                            value={availability[index].start}
                                                            onChange={(e) =>
                                                                  setAvailability((prev) => ({
                                                                        ...prev,
                                                                        [index]: { ...prev[index], start: e.target.value },
                                                                  }))
                                                            }
                                                      >
                                                            <option value="">Start</option>
                                                            {[...Array(24)].map((_, i) => (
                                                                  <option key={i} value={i}>{i}:00</option>
                                                            ))}
                                                      </select>

                                                      <select
                                                            value={availability[index].end}
                                                            onChange={(e) =>
                                                                  setAvailability((prev) => ({
                                                                        ...prev,
                                                                        [index]: { ...prev[index], end: e.target.value },
                                                                  }))
                                                            }
                                                      >
                                                            <option value="">End</option>
                                                            {[...Array(24)].map((_, i) => (
                                                                  <option key={i} value={i}>{i}:00</option>
                                                            ))}
                                                      </select>
                                                </div>
                                          ))}

                                          <button onClick={saveAvailability} style={{ marginTop: "10px" }}>
                                                Save Availability
                                          </button>
                                    </div>
                                    <div className="filter-tabs">
                                          <button
                                                className={filter === "ALL" ? "active" : ""}
                                                onClick={() => setFilter("ALL")}
                                          >
                                                All
                                          </button>

                                          <button
                                                className={filter === "PENDING" ? "active" : ""}
                                                onClick={() => setFilter("PENDING")}
                                          >
                                                Pending
                                          </button>

                                          <button
                                                className={filter === "ACCEPTED" ? "active" : ""}
                                                onClick={() => setFilter("ACCEPTED")}
                                          >
                                                Accepted
                                          </button>

                                          <button
                                                className={filter === "REJECTED" ? "active" : ""}
                                                onClick={() => setFilter("REJECTED")}
                                          >
                                                Rejected
                                          </button>
                                    </div>
                                    <div className="mentor-grid">
                                          {filteredInterviews.map((i) => (
                                                <div key={i.id} className="mentor-card">
                                                      <h3 className="mentor-topic">{i.topic}</h3>

                                                      <p className="mentor-text">
                                                            <strong>Student:</strong> {i.user?.name || "N/A"}
                                                      </p>

                                                      <p className="mentor-text">
                                                            <strong>Email:</strong> {i.user?.email || "N/A"}
                                                      </p>

                                                      <p className="mentor-text">
                                                            <strong>Date:</strong>{" "}
                                                            {new Date(i.date).toLocaleString()}
                                                      </p>

                                                      <p className="mentor-text">
                                                            <strong>Status:</strong>{" "}
                                                            <span
                                                                  className={`status-badge ${i.status === "ACCEPTED"
                                                                        ? "status-accepted"
                                                                        : i.status === "REJECTED"
                                                                              ? "status-rejected"
                                                                              : "status-pending"
                                                                        }`}
                                                            >
                                                                  {i.status}
                                                            </span>
                                                      </p>

                                                      {i.status === "PENDING" && (
                                                            <div className="action-buttons">
                                                                  <button
                                                                        className="btn btn-accept"
                                                                        onClick={() => handleAccept(i.id)}
                                                                        disabled={loadingId === i.id}
                                                                  >
                                                                        {loadingId === i.id ? "Accepting..." : "Accept"}
                                                                  </button>

                                                                  <button
                                                                        className="btn btn-reject"
                                                                        onClick={() => handleReject(i.id)}
                                                                        disabled={loadingId === i.id}
                                                                  >
                                                                        Reject
                                                                  </button>
                                                            </div>
                                                      )}

                                                      {i.status === "ACCEPTED" && (
                                                            <div className="action-buttons">

                                                                  <button
                                                                        className="btn btn-complete"
                                                                        onClick={() => setFeedbackModal(i)}
                                                                  >
                                                                        Complete Interview
                                                                  </button>

                                                            </div>
                                                      )}
                                                </div>
                                          ))}
                                    </div>
                              </>
                        )}
                  </div>
                  {feedbackModal && (
                        <div className="modal-overlay">

                              <div className="feedback-modal">

                                    <h2>Interview Feedback</h2>

                                    <div className="form-group">
                                          <label>Rating</label>

                                          <select
                                                value={feedbackForm.rating}
                                                onChange={(e) =>
                                                      setFeedbackForm({
                                                            ...feedbackForm,
                                                            rating: Number(e.target.value),
                                                      })
                                                }
                                          >
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                      <option key={n} value={n}>
                                                            {n} Star
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    <div className="form-group">
                                          <label>Strengths</label>

                                          <textarea
                                                rows={3}
                                                value={feedbackForm.strengths}
                                                onChange={(e) =>
                                                      setFeedbackForm({
                                                            ...feedbackForm,
                                                            strengths: e.target.value,
                                                      })
                                                }
                                          />
                                    </div>

                                    <div className="form-group">
                                          <label>Improvements</label>

                                          <textarea
                                                rows={3}
                                                value={feedbackForm.improvements}
                                                onChange={(e) =>
                                                      setFeedbackForm({
                                                            ...feedbackForm,
                                                            improvements: e.target.value,
                                                      })
                                                }
                                          />
                                    </div>

                                    <div className="form-group">
                                          <label>Overall Feedback</label>

                                          <textarea
                                                rows={4}
                                                value={feedbackForm.feedback}
                                                onChange={(e) =>
                                                      setFeedbackForm({
                                                            ...feedbackForm,
                                                            feedback: e.target.value,
                                                      })
                                                }
                                          />
                                    </div>

                                    <div className="modal-actions">

                                          <button
                                                className="btn btn-complete"
                                                onClick={handleCompleteInterview}
                                                disabled={submittingFeedback}
                                          >
                                                {submittingFeedback
                                                      ? "Submitting..."
                                                      : "Submit Feedback"}
                                          </button>

                                          <button
                                                className="btn btn-cancel"
                                                onClick={() => setFeedbackModal(null)}
                                          >
                                                Cancel
                                          </button>

                                    </div>

                              </div>

                        </div>
                  )}
            </>
      );
}