import { prisma } from "@/lib/prisma";
import { TRANSITIONS } from "@/lib/interviewStatus";

export const ALREADY_CHANGED = "This interview was already changed. Please refresh.";

export async function changeInterviewStatus({
  id,
  action,
  owner = {},
  where = {},
  data = {},
  include,
}) {
  const { from, to } = TRANSITIONS[action];

  const { count } = await prisma.interview.updateMany({
    where: { id, ...owner, ...where, status: { in: from } },
    data: { status: to, ...data },
  });

  const interview = await prisma.interview.findUnique({ where: { id }, include });

  if (count === 1) {
    return { interview };
  }

  if (!interview) {
    return { error: "Interview not found", status: 404 };
  }

  const isOwner = Object.entries(owner).every(([key, value]) => interview[key] === value);

  if (!isOwner) {
    return { error: "Forbidden", status: 403 };
  }

  return { error: ALREADY_CHANGED, status: 409, interview };
}
