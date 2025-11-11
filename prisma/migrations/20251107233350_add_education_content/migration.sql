-- CreateTable
CREATE TABLE "VisaInfo" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "visaType" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "cost" INTEGER,
    "requirements" JSONB NOT NULL,
    "processingTime" TEXT NOT NULL,
    "multiLanguage" JSONB NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageSchool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "languages" TEXT[],
    "courseDuration" TEXT NOT NULL,
    "pricePerWeek" INTEGER,
    "intensity" TEXT,
    "accommodation" BOOLEAN NOT NULL DEFAULT false,
    "certifications" TEXT[],
    "website" TEXT,
    "description" TEXT,
    "multiLanguage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguageSchool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostOfLiving" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "rent" INTEGER,
    "food" INTEGER,
    "transport" INTEGER,
    "utilities" INTEGER,
    "insurance" INTEGER,
    "miscellaneous" INTEGER,
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "multiLanguage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostOfLiving_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationGuide" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "timeline" TEXT NOT NULL,
    "documents" TEXT[],
    "tips" TEXT[],
    "deadlines" JSONB,
    "multiLanguage" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationGuide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisaInfo_country_idx" ON "VisaInfo"("country");

-- CreateIndex
CREATE INDEX "LanguageSchool_country_idx" ON "LanguageSchool"("country");

-- CreateIndex
CREATE INDEX "LanguageSchool_languages_idx" ON "LanguageSchool"("languages");

-- CreateIndex
CREATE INDEX "CostOfLiving_country_idx" ON "CostOfLiving"("country");

-- CreateIndex
CREATE UNIQUE INDEX "CostOfLiving_country_city_key" ON "CostOfLiving"("country", "city");

-- CreateIndex
CREATE INDEX "ApplicationGuide_country_idx" ON "ApplicationGuide"("country");
