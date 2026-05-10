"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import SkeletonInterviewCard from "@/components/skeletons/SkeletonInterviewCard";
import "./interviews.css";

export default function InterviewsPage() {

      const router = useRouter();

      const fetcher = (url) =>
            fetch(url).then((res) => res.json());

      const {
            data: interviews,
            isLoading,
            mutate,
      } = useSWR("/api/interviews", fetcher);

      const safeInterviews = Array.isArray(interviews)
            ? interviews
            : [];

      async function handleCancel(id) {

            const confirmCancel = confirm(
                  "Are you sure you want to cancel this interview?"
            );

            if (!confirmCancel) return;

            try {

                  const res = await fetch(
                        `/api/interviews/${id}/cancel`,
                        {
                              method: "PATCH",
                        }
                  );

                  if (!res.ok) {
                        toast.error("Failed to cancel");
                        return;
                  }

                  toast.success("Interview cancelled");
                  mutate();

            } catch (err) {
                  toast.error("Something went wrong");
            }
      }

      return (
            <section className="interviews-page">

                  {/* HEADER */}
                  <div className="interviews-header">
                        <div>
                              <h1>My Interviews</h1>
                              <p>
                                    Manage your scheduled mock interviews
                              </p>
                        </div>
                  </div>

                  {/* LOADING */}
                  {isLoading ? (
                        <div className="interview-grid">
                              {Array(6)
                                    .fill(0)
                                    .map((_, i) => (
                                          <SkeletonInterviewCard key={i} />
                                    ))}
                        </div>
                  ) : safeInterviews.length === 0 ? (

                        /* EMPTY */
                        <div className="empty-state">
                              <h3>No interviews yet</h3>

                              <p>
                                    Start by booking your first mock interview 🚀
                              </p>
                        </div>

                  ) : (

                        /* GRID */
                        <div className="interview-grid">

                              {safeInterviews.map((i) => (

                                    <div
                                          key={i.id}
                                          className="interview-card"
                                          onClick={() =>
                                                router.push(
                                                      `/dashboard/interviews/${i.id}`
                                                )
                                          }
                                    >

                                          {/* TOP */}
                                          <div className="card-top">

                                                <h3 className="card-title">
                                                      {i.topic}
                                                </h3>

                                                <span
                                                      className={`status-badge status-${i.status?.toLowerCase()}`}
                                                >
                                                      {i.status}
                                                </span>
                                          </div>

                                          {/* CONTENT */}
                                          <div className="card-body">

                                                <p className="card-text">
                                                      <strong>Date:</strong>{" "}
                                                      {new Date(i.date).toLocaleString()}
                                                </p>

                                                <p className="card-text">
                                                      <strong>Mentor:</strong>{" "}
                                                      {i.mentor?.name || "Not assigned"}
                                                </p>

                                                <p className="card-text">
                                                      <strong>Email:</strong>{" "}
                                                      {i.mentor?.email || "N/A"}
                                                </p>

                                          </div>

                                          {/* ACTIONS */}
                                          {["PENDING", "ACCEPTED"].includes(i.status) && (
                                                <div className="card-actions">

                                                      <button
                                                            className="cancel-btn"
                                                            onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  handleCancel(i.id);
                                                            }}
                                                      >
                                                            Cancel
                                                      </button>

                                                      <button
                                                            className="view-btn"
                                                            onClick={(e) => {
                                                                  e.stopPropagation();

                                                                  router.push(
                                                                        `/dashboard/interviews/${i.id}`
                                                                  );
                                                            }}
                                                      >
                                                            View Details
                                                      </button>

                                                </div>
                                          )}

                                    </div>
                              ))}
                        </div>
                  )}
            </section>
      );
}