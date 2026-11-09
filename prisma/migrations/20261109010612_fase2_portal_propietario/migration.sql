-- CreateTable
CREATE TABLE "behavior_logs" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "situation" TEXT NOT NULL,
    "stimulus" TEXT,
    "distance" TEXT,
    "behavior" TEXT NOT NULL,
    "ownerResponse" TEXT,
    "recoveryTime" TEXT,
    "comments" TEXT,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "behavior_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initialState" TEXT,
    "objectives" TEXT,
    "activitiesPerformed" TEXT,
    "changesObserved" TEXT,
    "pendingDifficulties" TEXT,
    "nextObjectives" TEXT,
    "professionalNotes" TEXT,
    "isVisibleToOwner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "behavior_logs" ADD CONSTRAINT "behavior_logs_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavior_logs" ADD CONSTRAINT "behavior_logs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "dogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
