/*
  Warnings:

  - The values [MALAM] on the enum `MealTime` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MealTime_new" AS ENUM ('PAGI', 'SIANG', 'SORE');
ALTER TABLE "MenuItem" ALTER COLUMN "mealTime" TYPE "MealTime_new" USING ("mealTime"::text::"MealTime_new");
ALTER TYPE "MealTime" RENAME TO "MealTime_old";
ALTER TYPE "MealTime_new" RENAME TO "MealTime";
DROP TYPE "public"."MealTime_old";
COMMIT;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "paketName" TEXT;
