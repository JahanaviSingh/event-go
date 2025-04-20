/*
  Warnings:

  - You are about to drop the column `organizer` on the `Show` table. All the data in the column will be lost.
  - Added the required column `Organizer` to the `Show` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Show" DROP COLUMN "organizer",
ADD COLUMN     "Organizer" TEXT NOT NULL;
