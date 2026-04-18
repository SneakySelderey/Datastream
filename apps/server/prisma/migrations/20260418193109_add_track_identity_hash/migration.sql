/*
  Warnings:

  - A unique constraint covering the columns `[identityHash]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Track" ADD COLUMN "identityHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Track_identityHash_key" ON "Track"("identityHash");
