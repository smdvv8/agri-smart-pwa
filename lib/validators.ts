import { z } from "zod";

export const languageSchema = z.enum(["RU", "TJ"]);
export const roleSchema = z.enum(["FARMER", "BUYER", "ADMIN"]);

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone is too short")
  .max(24, "Phone is too long")
  .regex(/^[+0-9 ()-]+$/, "Phone contains invalid characters");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  region: z.string().trim().max(80).optional().default(""),
  district: z.string().trim().max(80).optional().default(""),
  role: z.enum(["FARMER", "BUYER"]).default("FARMER"),
  language: languageSchema.default("RU"),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(160),
  password: z.string().min(1).max(128),
});

export const irrigationSchema = z.object({
  regionId: z.string().min(1),
  cropId: z.string().min(1),
  soilType: z.string().trim().min(2).max(80),
  growthStage: z.string().trim().min(2).max(80),
  fieldSize: z.coerce.number().positive().max(100000),
  dripIrrigation: z.coerce.boolean().default(false),
});

export const diagnosisFieldsSchema = z.object({
  regionId: z.string().min(1),
  cropId: z.string().min(1),
  soilType: z.string().trim().min(2).max(80),
  growthStage: z.string().trim().min(2).max(80),
});

export const aiChatSchema = z.object({
  question: z.string().trim().min(5).max(2000),
  language: languageSchema.default("RU"),
  regionId: z.string().optional(),
  cropId: z.string().optional(),
});

export const marketProductSchema = z.object({
  title: z.string().trim().min(3).max(120),
  cropId: z.string().min(1),
  description: z
    .string()
    .trim()
    .min(10, "Описание должно быть не короче 10 символов.")
    .max(2000, "Описание должно быть не длиннее 2000 символов."),
  price: z.coerce.number().positive().max(1_000_000_000),
  quantity: z.coerce.number().positive().max(1_000_000),
  unit: z.string().trim().min(1).max(30),
  regionId: z.string().min(1),
  district: z.string().trim().min(2).max(80),
  phone: phoneSchema,
});

export const marketSearchSchema = z.object({
  q: z.string().optional(),
  regionId: z.string().optional(),
  cropId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(48).default(24),
});

export const marketPriceAdviceSchema = z.object({
  productId: z.string().min(1),
  quality: z.string().trim().min(2).max(80).optional().default("standard"),
});

export const cropSchema = z.object({
  nameRu: z.string().trim().min(2).max(80),
  nameTj: z.string().trim().min(2).max(80),
  season: z.string().trim().min(2).max(120),
  wateringGuideRu: z.string().trim().min(10),
  wateringGuideTj: z.string().trim().min(10),
  commonDiseasesRu: z.string().trim().min(5),
  commonDiseasesTj: z.string().trim().min(5),
  careTipsRu: z.string().trim().min(10),
  careTipsTj: z.string().trim().min(10),
  harvestTimeRu: z.string().trim().min(2),
  harvestTimeTj: z.string().trim().min(2),
});

export const diseaseSchema = z.object({
  cropId: z.string().min(1),
  nameRu: z.string().trim().min(2).max(120),
  nameTj: z.string().trim().min(2).max(120),
  symptomsRu: z.string().trim().min(10),
  symptomsTj: z.string().trim().min(10),
  treatmentRu: z.string().trim().min(10),
  treatmentTj: z.string().trim().min(10),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});
