-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "height" REAL NOT NULL,
    "weight" REAL NOT NULL,
    "activityLevel" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "targetCalories" INTEGER NOT NULL,
    "targetProtein" REAL NOT NULL,
    "targetCarbs" REAL NOT NULL,
    "targetFat" REAL NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("activityLevel", "age", "createdAt", "discordId", "gender", "goal", "height", "id", "name", "targetCalories", "targetCarbs", "targetFat", "targetProtein", "updatedAt", "weight") SELECT "activityLevel", "age", "createdAt", "discordId", "gender", "goal", "height", "id", "name", "targetCalories", "targetCarbs", "targetFat", "targetProtein", "updatedAt", "weight" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
