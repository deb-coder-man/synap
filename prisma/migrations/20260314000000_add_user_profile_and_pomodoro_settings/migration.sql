-- AlterTable: add profile fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName"  TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username"  TEXT;

-- CreateIndex: unique username
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- AlterTable: add pomodoro settings to UserSettings
ALTER TABLE "UserSettings"
  ADD COLUMN IF NOT EXISTS "pomodoroFocusDuration" INTEGER NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS "pomodoroShortBreak"    INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "pomodoroLongBreak"     INTEGER NOT NULL DEFAULT 15;
