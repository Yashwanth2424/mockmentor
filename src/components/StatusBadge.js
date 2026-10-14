import { STATUS_LABELS } from "@/lib/interviewStatus";

export default function StatusBadge({ status, className = "status" }) {
  return (
    <span className={`${className} status-${status?.toLowerCase()}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
