CREATE UNIQUE INDEX "Interview_mentor_active_slot_key"
  ON "Interview" ("mentorId", "date")
  WHERE status IN ('PENDING', 'ACCEPTED');

CREATE UNIQUE INDEX "Interview_student_active_slot_key"
  ON "Interview" ("userId", "date")
  WHERE status IN ('PENDING', 'ACCEPTED');
