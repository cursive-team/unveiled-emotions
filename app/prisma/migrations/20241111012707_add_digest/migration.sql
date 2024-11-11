-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "photoId" INTEGER NOT NULL,
    "emotion" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);
