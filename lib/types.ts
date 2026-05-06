export type UserDto = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  region: string | null;
  district: string | null;
  role: "FARMER" | "BUYER" | "ADMIN";
  language: "RU" | "TJ";
  avatarUrl: string | null;
  createdAt: string;
};

export type RegionDto = {
  id: string;
  name: string;
  nameTj: string;
  latitude: number;
  longitude: number;
};

export type CropDto = {
  id: string;
  nameRu: string;
  nameTj: string;
  season: string;
  wateringGuideRu: string;
  wateringGuideTj: string;
  commonDiseasesRu: string;
  commonDiseasesTj: string;
  careTipsRu: string;
  careTipsTj: string;
  harvestTimeRu: string;
  harvestTimeTj: string;
  diseases?: DiseaseDto[];
};

export type DiseaseDto = {
  id: string;
  nameRu: string;
  nameTj: string;
  symptomsRu: string;
  symptomsTj: string;
  treatmentRu: string;
  treatmentTj: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export type WeatherDto = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  description: string;
  forecast: Array<{
    date: string;
    tempMin: number;
    tempMax: number;
    humidity: number;
    windSpeed: number;
    rainProbability: number;
    description: string;
  }>;
};

export type ProductDto = {
  id: string;
  title: string;
  description: string;
  price: string;
  quantity: number;
  unit: string;
  district: string;
  phone: string;
  photoUrl: string | null;
  status: "ACTIVE" | "SOLD" | "HIDDEN";
  createdAt: string;
  crop: CropDto;
  region: RegionDto;
  user?: Pick<UserDto, "id" | "fullName" | "role">;
};
