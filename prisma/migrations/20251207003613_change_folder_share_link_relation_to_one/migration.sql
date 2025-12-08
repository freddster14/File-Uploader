/*
  Warnings:

  - A unique constraint covering the columns `[folderId]` on the table `ShareLink` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_folderId_key" ON "ShareLink"("folderId");
