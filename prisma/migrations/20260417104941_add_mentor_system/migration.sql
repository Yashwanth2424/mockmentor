/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MENTOR';

-- DropIndex
DROP INDEX "Interview_userId_idx";

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "createdAt",
DROP COLUMN "feedback",
ADD COLUMN     "mentorId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt";

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
