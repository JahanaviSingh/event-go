-- AlterTable
ALTER TABLE "Auditorium" ADD COLUMN     "UniversityId" INTEGER,
ADD COLUMN     "openingHours" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'UNIVERSITY',
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "University" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "website" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Auditorium" ADD CONSTRAINT "Auditorium_UniversityId_fkey" FOREIGN KEY ("UniversityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
