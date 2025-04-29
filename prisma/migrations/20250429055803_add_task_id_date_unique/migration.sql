/*
  Warnings:

  - A unique constraint covering the columns `[taskId,date]` on the table `Completion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Completion_taskId_date_key" ON "Completion"("taskId", "date");
