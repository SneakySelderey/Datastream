/*
  Warnings:

  - A unique constraint covering the columns `[identityHash]` on the table `Album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identityHash]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Album" ADD COLUMN "identityHash" TEXT;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN "identityHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Album_identityHash_key" ON "Album"("identityHash");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_identityHash_key" ON "Artist"("identityHash");
