-- CreateEnum
CREATE TYPE "ProjectionType" AS ENUM ('STANDARD', 'DLP', 'LCD', 'LCOS', 'LASER_PROJECTOR', 'LED_PROJECTOR', 'SHORT_THROW_PROJECTOR', 'PANORAMIC_360_DEGREE_PROJECTION');

-- CreateEnum
CREATE TYPE "SoundSystemType" AS ENUM ('STANDARD', 'PA_SYSTEM', 'LINE_ARRAY_SYSTEM', 'POINT_SOURCE_SYSTEM', 'SURROUND_SOUND_SYSTEM', 'CEILING_OR_IN_WALL_SPEAKERS', 'SUBWOOFER_SYSTEM', 'WIRELESS_MICROPHONE_SYSTEM', 'DIGITAL_SIGNAL_PROCESSING_SYSTEM', 'BI_AMP_SYSTEM', 'TRI_AMP_SYSTEM');

-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('LECTURE', 'CONFERENCE', 'STUDENT_PERFORMANCE_AND_PRODUCTION', 'CONVOCATION_CEREMONY', 'CULTURAL', 'ART_EXHIBITION', 'FILM_SCREENING', 'WORKSHOP', 'TRAINING_SESSION', 'PANEL_DISCUSSION', 'DEBATE', 'OPEN_HOUSE_AND_ORIENTATION_EVENT', 'NETWORKING_AND_CAREER_FAIR', 'RELIGIOUS_AND_SPIRITUAL_GATHERING', 'CHARITY_AND_FUNDRAISING_EVENT', 'SPORTS_EVENT', 'E_SPORTS_EVENT', 'ALUMNI_EVENT_AND_REUNION', 'HEALTH_AND_WELLNESS_SEMINAR', 'POLITICAL_RALLY_AND_CAMPAIGN_EVENT', 'TECHNOLOGY_AND_INNOVATION_EXPO', 'CULTURAL_FEST', 'TECHNICAL_FEST', 'FEST');

-- CreateEnum
CREATE TYPE "ShowtimeStatus" AS ENUM ('POSTPONED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "AuditoriumId" INTEGER;

-- CreateTable
CREATE TABLE "Auditorium" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Auditorium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "AuditoriumId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Screen" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "number" INTEGER NOT NULL,
    "AuditoriumId" INTEGER NOT NULL,
    "projectionType" "ProjectionType" NOT NULL DEFAULT 'STANDARD',
    "soundSystemType" "SoundSystemType" NOT NULL DEFAULT 'STANDARD',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 180,

    CONSTRAINT "Screen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "screenId" INTEGER NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("screenId","row","column")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "genre" "Genre" NOT NULL,
    "duration" INTEGER NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "posterUrl" TEXT,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Showtime" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "showId" INTEGER NOT NULL,
    "screenId" INTEGER NOT NULL,
    "status" "ShowtimeStatus",

    CONSTRAINT "Showtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "showtimeId" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "screenId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "qrCode" TEXT,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_AuditoriumId_key" ON "Address"("AuditoriumId");

-- CreateIndex
CREATE UNIQUE INDEX "Screen_AuditoriumId_number_key" ON "Screen"("AuditoriumId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Showtime_startTime_screenId_key" ON "Showtime"("startTime", "screenId");

-- CreateIndex
CREATE INDEX "seatIndex" ON "Booking"("screenId", "row", "column");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_screenId_row_column_showtimeId_key" ON "Booking"("screenId", "row", "column", "showtimeId");

-- AddForeignKey
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_AuditoriumId_fkey" FOREIGN KEY ("AuditoriumId") REFERENCES "Auditorium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_AuditoriumId_fkey" FOREIGN KEY ("AuditoriumId") REFERENCES "Auditorium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screen" ADD CONSTRAINT "Screen_AuditoriumId_fkey" FOREIGN KEY ("AuditoriumId") REFERENCES "Auditorium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_screenId_row_column_fkey" FOREIGN KEY ("screenId", "row", "column") REFERENCES "Seat"("screenId", "row", "column") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
