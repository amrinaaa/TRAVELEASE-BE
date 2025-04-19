/*
  Warnings:

  - A unique constraint covering the columns `[facilityName]` on the table `Facility` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Facility_facilityName_key" ON "Facility"("facilityName");
