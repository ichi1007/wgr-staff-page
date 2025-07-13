/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Customs` table. All the data in the column will be lost.
  - You are about to drop the column `sheetId` on the `Customs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customs" DROP COLUMN "createdAt",
DROP COLUMN "sheetId",
ADD COLUMN     "spreadsheetId" TEXT,
ADD COLUMN     "spreadsheetUrl" TEXT,
ALTER COLUMN "itemCount" DROP NOT NULL,
ALTER COLUMN "itemCount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "TeamResult" ADD COLUMN     "matchPoint" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "winner" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Custom" (
    "id" TEXT NOT NULL,
    "customsId" TEXT NOT NULL,
    "spreadsheetId" TEXT,
    "spreadsheetUrl" TEXT,

    CONSTRAINT "Custom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Custom" ADD CONSTRAINT "Custom_customsId_fkey" FOREIGN KEY ("customsId") REFERENCES "Customs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
