-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "phoneNumber" TEXT,
    "currentCountry" TEXT,
    "currentCity" TEXT,
    "highestDegree" TEXT,
    "fieldOfStudy" TEXT,
    "gpa" DOUBLE PRECISION,
    "graduationYear" INTEGER,
    "institution" TEXT,
    "toeflScore" INTEGER,
    "ieltsScore" DOUBLE PRECISION,
    "satScore" INTEGER,
    "greScore" INTEGER,
    "gmatScore" INTEGER,
    "preferredCountries" TEXT[],
    "preferredCities" TEXT[],
    "preferredFields" TEXT[],
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "intakeYear" INTEGER,
    "intakeSemester" TEXT,
    "workExperience" TEXT,
    "hasScholarship" BOOLEAN NOT NULL DEFAULT false,
    "needsVisa" BOOLEAN NOT NULL DEFAULT true,
    "languageProficiency" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityWishlist" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "notes" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityWishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "intake" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "appliedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "documents" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentProfile_userId_idx" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "UniversityWishlist_studentId_idx" ON "UniversityWishlist"("studentId");

-- CreateIndex
CREATE INDEX "UniversityWishlist_universityId_idx" ON "UniversityWishlist"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityWishlist_studentId_universityId_key" ON "UniversityWishlist"("studentId", "universityId");

-- CreateIndex
CREATE INDEX "Application_studentId_idx" ON "Application"("studentId");

-- CreateIndex
CREATE INDEX "Application_universityId_idx" ON "Application"("universityId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityWishlist" ADD CONSTRAINT "UniversityWishlist_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityWishlist" ADD CONSTRAINT "UniversityWishlist_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
