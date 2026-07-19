-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meal" (
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
    "vitaminA" REAL,
    "vitaminC" REAL,
    "vitaminD" REAL,
    "calcium" REAL,
    "iron" REAL,
    "healthRating" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "eatenAt" DATETIME NOT NULL,
    "notes" TEXT,
    "source" TEXT NOT NULL,
    "imageId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Meal_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Meal" ("calories", "carbs", "createdAt", "eatenAt", "fat", "fiber", "healthRating", "id", "imageId", "mealType", "name", "notes", "protein", "sodium", "source", "sugar", "updatedAt", "userId") SELECT "calories", "carbs", "createdAt", "eatenAt", "fat", "fiber", "healthRating", "id", "imageId", "mealType", "name", "notes", "protein", "sodium", "source", "sugar", "updatedAt", "userId" FROM "Meal";
DROP TABLE "Meal";
ALTER TABLE "new_Meal" RENAME TO "Meal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
