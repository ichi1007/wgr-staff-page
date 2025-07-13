/*
  Warnings:

  - You are about to drop the column `spreadsheetId` on the `Customs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customs" DROP COLUMN "spreadsheetId",
ADD COLUMN     "sheetId" TEXT;
