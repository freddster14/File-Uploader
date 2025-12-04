-- CreateTable
CREATE TABLE "LinkAccess" (
    "id" SERIAL NOT NULL,
    "shareLinkId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkAccess_pkey" PRIMARY KEY ("shareLinkId","userId")
);

-- AddForeignKey
ALTER TABLE "LinkAccess" ADD CONSTRAINT "LinkAccess_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
