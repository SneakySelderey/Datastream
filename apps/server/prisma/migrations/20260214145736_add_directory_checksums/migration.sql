-- CreateTable
CREATE TABLE "ScannerDirectoryState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "directoryPath" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ScannerDirectoryState_directoryPath_key" ON "ScannerDirectoryState"("directoryPath");
