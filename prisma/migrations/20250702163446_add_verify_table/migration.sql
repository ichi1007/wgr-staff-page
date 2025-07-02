/*
  Warnings:

  - A unique constraint covering the columns `[verifyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verifyId" INTEGER;

-- CreateTable
CREATE TABLE "Verify" (
    "id" SERIAL NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "emailCode" TEXT NOT NULL,
    "teamCode" TEXT NOT NULL,

    CONSTRAINT "Verify_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_verifyId_key" ON "User"("verifyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_verifyId_fkey" FOREIGN KEY ("verifyId") REFERENCES "Verify"("id") ON DELETE SET NULL ON UPDATE CASCADE;
