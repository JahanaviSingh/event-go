/*
  Warnings:

  - You are about to drop the column `Organizer` on the `Show` table. All the data in the column will be lost.
  - Added the required column `organizer` to the `Show` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Show" DROP COLUMN "Organizer",
ADD COLUMN     "organizer" TEXT NOT NULL;
