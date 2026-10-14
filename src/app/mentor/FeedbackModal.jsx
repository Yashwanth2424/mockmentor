"use client";

import { useState } from "react";
import { toast } from "react-toastify";

const EMPTY_FORM = { rating: 5, feedback: "", strengths: "", improvements: "" };

export default function FeedbackModal({ interview, onClose, onCompleted }) {
  const [feedbackForm, setFeedbackForm] = useState(EMPTY_FORM);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  async function handleCompleteInterview() {
    setSubmittingFeedback(true);

    try {
      const res = await fetch(`/api/mentor/interviews/${interview.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed");
        return;
      }

      toast.success("Interview completed");
      onCompleted();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingFeedback(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="feedback-modal">
        <h2>Interview Feedback</h2>

        <div className="form-group">
          <label>Rating</label>
          <select
            value={feedbackForm.rating}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
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
            onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Improvements</label>
          <textarea
            rows={3}
            value={feedbackForm.improvements}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, improvements: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Overall Feedback</label>
          <textarea
            rows={4}
            value={feedbackForm.feedback}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
          />
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-complete"
            onClick={handleCompleteInterview}
            disabled={submittingFeedback}
          >
            {submittingFeedback ? "Submitting..." : "Submit Feedback"}
          </button>
          <button className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
