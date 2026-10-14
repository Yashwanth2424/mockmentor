"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { formatDateTime } from "@/lib/time";

import SkeletonInterviewCard from "@/components/skeletons/SkeletonInterviewCard";

import { fetcher } from "@/lib/fetcher";
import StatusBadge from "@/components/StatusBadge";
import { canTransition } from "@/lib/interviewStatus";

import RescheduleModal from "./RescheduleModal";
import "./interviews.css";

export default function InterviewsPage() {
  const router = useRouter();

  const [loadingId, setLoadingId] = useState(null);

  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const { data: interviews = [], isLoading, error, mutate } = useSWR("/api/interviews", fetcher);

  const { data: mentors = [] } = useSWR("/api/mentor", fetcher);

  const safeInterviews = Array.isArray(interviews) ? interviews : [];

  async function handleCancel(id) {
    const confirmCancel = confirm("Are you sure you want to cancel this interview?");

    if (!confirmCancel) {
      return;
    }

    try {
      setLoadingId(id);

      const res = await fetch(`/api/interviews/${id}/cancel`, {
        method: "PATCH",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to cancel interview");

        return;
      }

      toast.success("Interview cancelled");

      mutate();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="interviews-page">
      <div className="interviews-header">
        <div>
          <h1>My Interviews</h1>

          <p>Manage your scheduled mock interviews</p>
        </div>
      </div>

      {isLoading ? (
        <div className="interview-grid">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <SkeletonInterviewCard key={i} />
            ))}
        </div>
      ) : error ? (
        <div className="empty-state">
          <h3>Failed to load interviews</h3>

          <p>Please refresh the page</p>
        </div>
      ) : !isLoading && safeInterviews.length === 0 ? (
        <div className="empty-state">
          <h3>No interviews yet</h3>

          <p>Start by booking your first mock interview</p>
        </div>
      ) : (
        <div className="interview-grid">
          {safeInterviews.map((i) => (
            <div
              key={i.id}
              className="interview-card"
              onClick={() => router.push(`/dashboard/interviews/${i.id}`)}
            >
              <div className="card-top">
                <h3 className="card-title">{i.topic}</h3>

                <StatusBadge status={i.status} className="status-badge" />
              </div>

              <div className="card-body">
                <p className="card-text">
                  <strong>Date:</strong> {formatDateTime(i.date)}
                </p>

                <p className="card-text">
                  <strong>Mentor:</strong> {i.mentor?.name || "Not assigned"}
                </p>

                <p className="card-text">
                  <strong>Email:</strong> {i.mentor?.email || "N/A"}
                </p>
              </div>

              <div className="card-actions">
                {canTransition("cancel", i.status) && (
                  <>
                    <button
                      className="cancel-btn"
                      disabled={loadingId === i.id}
                      onClick={(e) => {
                        e.stopPropagation();

                        handleCancel(i.id);
                      }}
                    >
                      {loadingId === i.id ? "Cancelling..." : "Cancel"}
                    </button>

                    <button
                      className="reschedule-btn"
                      onClick={(e) => {
                        e.stopPropagation();

                        setRescheduleTarget(i);
                      }}
                    >
                      Reschedule
                    </button>
                  </>
                )}

                <button
                  className="view-btn"
                  onClick={(e) => {
                    e.stopPropagation();

                    router.push(`/dashboard/interviews/${i.id}`);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rescheduleTarget && (
        <RescheduleModal
          interview={rescheduleTarget}
          interviews={safeInterviews}
          mentors={mentors}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={() => {
            setRescheduleTarget(null);
            mutate();
          }}
        />
      )}
    </section>
  );
}
