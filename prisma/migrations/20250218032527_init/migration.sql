/*
  Warnings:

  - You are about to drop the `Recording` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recording" DROP CONSTRAINT "Recording_userId_fkey";

-- DropTable
DROP TABLE "Recording";

-- CreateTable
CREATE TABLE "Recordings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recordings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Recordings" ADD CONSTRAINT "Recordings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
