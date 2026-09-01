/*
  Warnings:

  - You are about to drop the column `isActive` on the `MenuItem` table. All the data in the column will be lost.
  - Added the required column `menuName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "menuName" TEXT NOT NULL,
ADD COLUMN     "paketName" TEXT,
ALTER COLUMN "menuItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
