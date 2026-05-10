-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "improvements" TEXT,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "strengths" TEXT;
