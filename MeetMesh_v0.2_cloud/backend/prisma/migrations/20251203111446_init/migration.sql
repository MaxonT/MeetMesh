-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "tz" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "startISO" TEXT NOT NULL,
    "endISO" TEXT NOT NULL,
    "hStart" INTEGER NOT NULL,
    "hEnd" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pollId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cells" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Availability_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Availability_pollId_name_key" ON "Availability"("pollId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
