-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Interview_mentorId_date_idx" ON "Interview"("mentorId", "date");

-- CreateIndex
CREATE INDEX "Interview_userId_date_idx" ON "Interview"("userId", "date");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");
