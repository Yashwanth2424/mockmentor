"use client";

import SkeletonDetails from "@/components/skeletons/SkeletonDetails";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "react-toastify";
import { formatDateTime } from "@/lib/time";
import "./details.css";

const fetcher = async (url) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || "Failed");
  return json.data;
};

export default function InterviewDetails() {
  const { id } = useParams();
  const router = useRouter();

  const {
    data: interview,
    isLoading,
    error,
    mutate,
  } = useSWR(id ? `/api/admin/interviews/${id}` : null, fetcher, { revalidateOnFocus: false });

  const [cancelling, setCancelling] = useState(false);

  async function cancelInterview() {
    if (cancelling) return;
    if (!confirm("Cancel this interview?")) return;

    setCancelling(true);

    try {
      const res = await fetch(`/api/admin/interviews/${id}/cancel`, { method: "PATCH" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Could not cancel");
        return;
      }

      toast.success("Interview cancelled");
      mutate();
    } catch {
      toast.error("Server error");
    } finally {
      setCancelling(false);
    }
  }

  if (isLoading) return <SkeletonDetails />;

  if (error || !interview) {
    return (
      <div className="admin-details">
        <button className="back-btn" onClick={() => router.push("/admin")}>
          ← Back to Admin
        </button>
        <div className="details-card">
          <h2>Interview not found</h2>
        </div>
      </div>
    );
  }

  const canCancel = ["PENDING", "ACCEPTED"].includes(interview.status);

  return (
    <div className="admin-details">
      <button className="back-btn" onClick={() => router.push("/admin")}>
        ← Back to Admin
      </button>

      <h1>Interview Details</h1>

      <div className="details-card">
        <h2>{interview.topic}</h2>

        <p>
          <strong>Status:</strong>{" "}
          <span className={`status status-${interview.status.toLowerCase()}`}>
            {interview.status}
          </span>
        </p>

        <p>
          <strong>Date:</strong> {interview.date ? formatDateTime(interview.date) : "N/A"} (German
          time)
        </p>

        <p>
          <strong>Student:</strong> {interview.user?.name} ({interview.user?.email})
        </p>

        <p>
          <strong>Mentor:</strong>{" "}
          {interview.mentor
            ? `${interview.mentor.name} (${interview.mentor.email})`
            : "Not assigned"}
        </p>

        <div className="feedback">
          <h3>Mentor Feedback</h3>

          {interview.status === "COMPLETED" && interview.feedback ? (
            <>
              {interview.rating && (
                <p>
                  <strong>Rating:</strong> {interview.rating} / 5
                </p>
              )}
              {interview.strengths && (
                <p>
                  <strong>Strengths:</strong> {interview.strengths}
                </p>
              )}
              {interview.improvements && (
                <p>
                  <strong>Areas to improve:</strong> {interview.improvements}
                </p>
              )}
              <p>
                <strong>Overall:</strong> {interview.feedback}
              </p>
            </>
          ) : (
            <p>The mentor adds feedback after completing the interview.</p>
          )}
        </div>

        {canCancel && (
          <div className="actions">
            <button className="cancel" disabled={cancelling} onClick={cancelInterview}>
              {cancelling ? "Cancelling..." : "Cancel Interview"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
