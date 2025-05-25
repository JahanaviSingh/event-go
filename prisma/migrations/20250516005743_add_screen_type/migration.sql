-- CreateEnum
CREATE TYPE "ScreenType" AS ENUM ('STRAIGHT', 'CURVED');

-- AlterTable
ALTER TABLE "Screen" ADD COLUMN     "screenType" "ScreenType" NOT NULL DEFAULT 'STRAIGHT';
