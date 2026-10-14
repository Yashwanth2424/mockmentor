export const TRANSITIONS = {
  accept: { from: ["PENDING"], to: "ACCEPTED" },
  reject: { from: ["PENDING"], to: "REJECTED" },
  complete: { from: ["ACCEPTED"], to: "COMPLETED" },
  cancel: { from: ["PENDING", "ACCEPTED"], to: "CANCELLED" },
  reschedule: { from: ["PENDING", "ACCEPTED"], to: "PENDING" },
};

export function canTransition(action, status) {
  return TRANSITIONS[action]?.from.includes(status) ?? false;
}
