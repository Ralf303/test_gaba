CREATE TABLE "PromoCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountPercent" INTEGER NOT NULL,
  "activationLimit" INTEGER NOT NULL,
  "activationCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Activation" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "promoCodeId" TEXT NOT NULL,
  CONSTRAINT "Activation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
CREATE UNIQUE INDEX "Activation_promoCodeId_email_key" ON "Activation"("promoCodeId", "email");
CREATE INDEX "Activation_promoCodeId_idx" ON "Activation"("promoCodeId");

ALTER TABLE "Activation"
ADD CONSTRAINT "Activation_promoCodeId_fkey"
FOREIGN KEY ("promoCodeId")
REFERENCES "PromoCode"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
