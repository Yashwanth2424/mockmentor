export const ACTIVE_STATUSES = ["PENDING", "ACCEPTED"];

export const STATUS_LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export const TRANSITIONS = {
  accept: { from: ["PENDING"], to: "ACCEPTED" },
  reject: { from: ["PENDING"], to: "REJECTED" },
  complete: { from: ["ACCEPTED"], to: "COMPLETED" },
  cancel: { from: ACTIVE_STATUSES, to: "CANCELLED" },
  reschedule: { from: ACTIVE_STATUSES, to: "PENDING" },
};

export function canTransition(action, status) {
  return TRANSITIONS[action]?.from.includes(status) ?? false;
}
