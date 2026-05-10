/*
  Warnings:

  - You are about to drop the column `availabilityEnd` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `availabilityStart` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "availabilityEnd",
DROP COLUMN "availabilityStart";
