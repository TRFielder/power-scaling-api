/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Character` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageFileName]` on the table `Character` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageFileName` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Character_imageUrl_key";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "imageUrl",
ADD COLUMN     "imageFileName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Character_imageFileName_key" ON "Character"("imageFileName");
