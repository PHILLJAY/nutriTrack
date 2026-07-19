-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MealTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "fiber" REAL,
    "sugar" REAL,
    "sodium" REAL,
    "mealType" TEXT NOT NULL,
    "notes" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MealTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MealTemplate" ("calories", "carbs", "createdAt", "fat", "fiber", "id", "mealType", "name", "notes", "protein", "sodium", "sugar", "updatedAt", "userId") SELECT "calories", "carbs", "createdAt", "fat", "fiber", "id", "mealType", "name", "notes", "protein", "sodium", "sugar", "updatedAt", "userId" FROM "MealTemplate";
DROP TABLE "MealTemplate";
ALTER TABLE "new_MealTemplate" RENAME TO "MealTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
