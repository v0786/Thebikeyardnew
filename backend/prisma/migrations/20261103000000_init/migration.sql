-- The Bike Yard PostgreSQL Initialization Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "dealerships" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "tagline" VARCHAR(255),
    "addressLine1" VARCHAR(255) NOT NULL,
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(80) NOT NULL DEFAULT 'Thane',
    "state" VARCHAR(80) NOT NULL DEFAULT 'Maharashtra',
    "pincode" VARCHAR(10) NOT NULL,
    "stateCode" VARCHAR(2) NOT NULL DEFAULT '27',
    "gstin" VARCHAR(15) NOT NULL,
    "rtoCode" VARCHAR(10) NOT NULL DEFAULT 'MH-04',
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "invoicePrefix" VARCHAR(30) NOT NULL DEFAULT 'TBY-INV-2026-',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dealerships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dealerships_code_key" UNIQUE ("code"),
    CONSTRAINT "dealerships_gstin_key" UNIQUE ("gstin")
);

CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "roles_name_key" UNIQUE ("name")
);

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dealershipId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "emailVerified" TIMESTAMPTZ(6),
    "passwordHash" VARCHAR(255),
    "phone" VARCHAR(20),
    "roleId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "dealerships"("id") ON DELETE RESTRICT,
    CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT
);

CREATE TABLE "stock_units" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dealershipId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "chassisNumber" VARCHAR(30) NOT NULL,
    "engineNumber" VARCHAR(30) NOT NULL,
    "colorName" VARCHAR(60) NOT NULL,
    "purchasePricePaise" BIGINT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK',
    "location" VARCHAR(120) NOT NULL DEFAULT 'Main Showroom',
    "pdiPassed" BOOLEAN NOT NULL DEFAULT false,
    "inwardDate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_units_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "stock_units_chassisNumber_key" UNIQUE ("chassisNumber"),
    CONSTRAINT "stock_units_engineNumber_key" UNIQUE ("engineNumber")
);
