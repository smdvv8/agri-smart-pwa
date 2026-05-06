export const irrigationAdviceJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "irrigation_needed",
    "best_time_ru",
    "best_time_tj",
    "water_amount_ru",
    "water_amount_tj",
    "reason_ru",
    "reason_tj",
    "rain_warning_ru",
    "rain_warning_tj",
    "water_saving_ru",
    "water_saving_tj",
    "disclaimer_ru",
    "disclaimer_tj",
  ],
  properties: {
    irrigation_needed: { type: "boolean" },
    best_time_ru: { type: "string" },
    best_time_tj: { type: "string" },
    water_amount_ru: { type: "string" },
    water_amount_tj: { type: "string" },
    reason_ru: { type: "string" },
    reason_tj: { type: "string" },
    rain_warning_ru: { type: "string" },
    rain_warning_tj: { type: "string" },
    water_saving_ru: { type: "array", items: { type: "string" } },
    water_saving_tj: { type: "array", items: { type: "string" } },
    disclaimer_ru: { type: "string" },
    disclaimer_tj: { type: "string" },
  },
};

export const diagnosisAdviceJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "crop",
    "region",
    "detected_problem",
    "confidence",
    "risk_level",
    "simple_explanation_ru",
    "simple_explanation_tj",
    "what_to_do_today_ru",
    "what_to_do_today_tj",
    "watering_advice_ru",
    "watering_advice_tj",
    "three_day_plan_ru",
    "three_day_plan_tj",
    "water_saving_tip_ru",
    "water_saving_tip_tj",
    "when_to_call_agronomist_ru",
    "when_to_call_agronomist_tj",
    "disclaimer_ru",
    "disclaimer_tj",
  ],
  properties: {
    crop: { type: "string" },
    region: { type: "string" },
    detected_problem: { type: "string" },
    confidence: { type: "number" },
    risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
    simple_explanation_ru: { type: "string" },
    simple_explanation_tj: { type: "string" },
    what_to_do_today_ru: { type: "array", items: { type: "string" } },
    what_to_do_today_tj: { type: "array", items: { type: "string" } },
    watering_advice_ru: { type: "string" },
    watering_advice_tj: { type: "string" },
    three_day_plan_ru: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "actions"],
        properties: {
          day: { type: "number" },
          actions: { type: "array", items: { type: "string" } },
        },
      },
    },
    three_day_plan_tj: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "actions"],
        properties: {
          day: { type: "number" },
          actions: { type: "array", items: { type: "string" } },
        },
      },
    },
    water_saving_tip_ru: { type: "string" },
    water_saving_tip_tj: { type: "string" },
    when_to_call_agronomist_ru: { type: "string" },
    when_to_call_agronomist_tj: { type: "string" },
    disclaimer_ru: { type: "string" },
    disclaimer_tj: { type: "string" },
  },
};

export const chatAdviceJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["answer_ru", "answer_tj"],
  properties: {
    answer_ru: { type: "string" },
    answer_tj: { type: "string" },
  },
};

export const marketPriceAdviceJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "recommended_price",
    "reason_ru",
    "reason_tj",
    "selling_tip_ru",
    "selling_tip_tj",
    "description_improvement_ru",
    "description_improvement_tj",
  ],
  properties: {
    recommended_price: { type: "string" },
    reason_ru: { type: "string" },
    reason_tj: { type: "string" },
    selling_tip_ru: { type: "string" },
    selling_tip_tj: { type: "string" },
    description_improvement_ru: { type: "string" },
    description_improvement_tj: { type: "string" },
  },
};

export function toRiskLevel(value: string) {
  const normalized = value.toUpperCase();
  if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(normalized)) {
    return normalized as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }

  return "MEDIUM";
}
