import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const regions = [
  { name: "Isfara", nameTj: "Исфара", latitude: 40.1265, longitude: 70.6253 },
  { name: "Khujand", nameTj: "Хуҷанд", latitude: 40.2833, longitude: 69.6222 },
  { name: "Dushanbe", nameTj: "Душанбе", latitude: 38.5598, longitude: 68.787 },
  { name: "Bokhtar", nameTj: "Бохтар", latitude: 37.8364, longitude: 68.7803 },
  { name: "Kulob", nameTj: "Кӯлоб", latitude: 37.9146, longitude: 69.7845 },
  { name: "Panjakent", nameTj: "Панҷакент", latitude: 39.4952, longitude: 67.6093 },
  { name: "Hisor", nameTj: "Ҳисор", latitude: 38.525, longitude: 68.5512 },
  { name: "Khorog", nameTj: "Хоруғ", latitude: 37.4897, longitude: 71.553 },
  { name: "Istaravshan", nameTj: "Истаравшан", latitude: 39.9142, longitude: 69.0033 },
  { name: "Konibodom", nameTj: "Конибодом", latitude: 40.2941, longitude: 70.4312 },
  { name: "Vahdat", nameTj: "Ваҳдат", latitude: 38.5563, longitude: 69.0135 },
];

const crops = [
  {
    nameRu: "Томат",
    nameTj: "Помидор",
    season: "Весна-лето",
    wateringGuideRu:
      "Поливать глубоко 2-3 раза в неделю, чаще в жару и во время плодоношения.",
    wateringGuideTj:
      "Ҳафтае 2-3 маротиба чуқур об диҳед, дар гармӣ ва вақти ҳосилбандӣ бештар.",
    commonDiseasesRu: "Фитофтороз, мучнистая роса, вершинная гниль.",
    commonDiseasesTj: "Фитофтороз, сафедак, пӯсидани нӯги мева.",
    careTipsRu:
      "Подвязывайте кусты, удаляйте нижние листья, проветривайте посадки.",
    careTipsTj:
      "Буттаҳоро бандед, баргҳои поёниро гиред, байни ниҳолҳоро шамол диҳед.",
    harvestTimeRu: "Июнь-сентябрь",
    harvestTimeTj: "Июн-сентябр",
    diseases: [
      {
        nameRu: "Фитофтороз",
        nameTj: "Фитофтороз",
        symptomsRu: "Темные пятна на листьях и плодах, быстрое увядание.",
        symptomsTj: "Доғҳои торик дар барг ва мева, пажмурда шудани тез.",
        treatmentRu:
          "Удалить пораженные листья, снизить влажность, применить разрешенный фунгицид.",
        treatmentTj:
          "Баргҳои зарардидаро гиред, намиро кам кунед, фунгициди иҷозатшударо истифода баред.",
        riskLevel: "HIGH" as const,
      },
    ],
  },
  {
    nameRu: "Картофель",
    nameTj: "Картошка",
    season: "Весна-осень",
    wateringGuideRu:
      "Поддерживать равномерную влажность, особенно при бутонизации и клубнеобразовании.",
    wateringGuideTj:
      "Намнокиро баробар нигоҳ доред, махсусан вақти ғунчабандӣ ва пайдоиши лӯнда.",
    commonDiseasesRu: "Фитофтороз, парша, черная ножка.",
    commonDiseasesTj: "Фитофтороз, қасқоқ, поясиёҳ.",
    careTipsRu: "Окучивайте, не допускайте застоя воды, чередуйте культуры.",
    careTipsTj: "Хоккашӣ кунед, обро нигоҳ надоред, киштгардонро риоя кунед.",
    harvestTimeRu: "Июль-октябрь",
    harvestTimeTj: "Июл-октябр",
    diseases: [
      {
        nameRu: "Парша",
        nameTj: "Қасқоқ",
        symptomsRu: "Шершавые пятна и язвочки на клубнях.",
        symptomsTj: "Доғҳои ноҳамвор ва захмчаҳо дар лӯнда.",
        treatmentRu:
          "Использовать здоровой семенной материал, соблюдать севооборот и умеренный полив.",
        treatmentTj:
          "Тухмии солим, киштгардон ва обёрии мӯътадилро истифода баред.",
        riskLevel: "MEDIUM" as const,
      },
    ],
  },
  {
    nameRu: "Хлопок",
    nameTj: "Пахта",
    season: "Весна-осень",
    wateringGuideRu:
      "Критичен полив в фазах бутонизации, цветения и формирования коробочек.",
    wateringGuideTj:
      "Дар марҳилаҳои ғунча, гулкунӣ ва пайдоиши кӯрак обёрӣ муҳим аст.",
    commonDiseasesRu: "Вертициллезное увядание, корневая гниль.",
    commonDiseasesTj: "Пажмурдаи вертициллӣ, пӯсидани реша.",
    careTipsRu:
      "Контролируйте сорняки, не переувлажняйте, следите за вредителями.",
    careTipsTj:
      "Алафҳои бегонаро назорат кунед, аз ҳад зиёд об надиҳед, ҳашаротро пайгирӣ кунед.",
    harvestTimeRu: "Сентябрь-ноябрь",
    harvestTimeTj: "Сентябр-ноябр",
    diseases: [
      {
        nameRu: "Вертициллезное увядание",
        nameTj: "Пажмурдаи вертициллӣ",
        symptomsRu: "Желтение листьев, бурые сосуды стебля, слабый рост.",
        symptomsTj: "Зардшавии барг, қаҳваранг шудани рагҳои поя, сустшавии рушд.",
        treatmentRu:
          "Убрать сильно пораженные растения, применять севооборот и устойчивые сорта.",
        treatmentTj:
          "Ниҳолҳои сахт зарардидаро гиред, киштгардон ва навъҳои устуворро истифода баред.",
        riskLevel: "HIGH" as const,
      },
    ],
  },
  {
    nameRu: "Виноград",
    nameTj: "Ангур",
    season: "Весна-осень",
    wateringGuideRu:
      "Полив редкий, но глубокий; уменьшать воду перед созреванием ягод.",
    wateringGuideTj:
      "Обёрӣ кам, вале чуқур; пеш аз пухтани ангур обро кам кунед.",
    commonDiseasesRu: "Милдью, оидиум, серая гниль.",
    commonDiseasesTj: "Милдю, оидиум, пӯсидани хокистарӣ.",
    careTipsRu:
      "Обрезайте лозу, улучшайте проветривание, не смачивайте листья вечером.",
    careTipsTj:
      "Токро буред, шамолгузариро беҳтар кунед, шом баргро тар накунед.",
    harvestTimeRu: "Август-октябрь",
    harvestTimeTj: "Август-октябр",
    diseases: [
      {
        nameRu: "Оидиум",
        nameTj: "Оидиум",
        symptomsRu: "Белый мучнистый налет на листьях и ягодах.",
        symptomsTj: "Қабати сафеди ордмонанд дар барг ва донаҳо.",
        treatmentRu:
          "Удалить пораженные части, улучшить проветривание, применить серные препараты по инструкции.",
        treatmentTj:
          "Қисмҳои зарардидаро гиред, шамолгузариро беҳтар кунед, доруҳои сулфурдорро мувофиқи дастур истифода баред.",
        riskLevel: "MEDIUM" as const,
      },
    ],
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for seeding.");
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const region of regions) {
    await prisma.region.upsert({
      where: { name: region.name },
      update: region,
      create: region,
    });
  }

  for (const cropData of crops) {
    const { diseases, ...crop } = cropData;
    const existing = await prisma.crop.findFirst({ where: { nameRu: crop.nameRu } });
    const savedCrop = existing
      ? await prisma.crop.update({ where: { id: existing.id }, data: crop })
      : await prisma.crop.create({ data: crop });

    for (const disease of diseases) {
      const existingDisease = await prisma.disease.findFirst({
        where: { cropId: savedCrop.id, nameRu: disease.nameRu },
      });

      if (existingDisease) {
        await prisma.disease.update({
          where: { id: existingDisease.id },
          data: disease,
        });
      } else {
        await prisma.disease.create({
          data: { ...disease, cropId: savedCrop.id },
        });
      }
    }
  }

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: process.env.SEED_ADMIN_EMAIL },
      update: { role: "ADMIN", passwordHash },
      create: {
        fullName: "AgriSmart Admin",
        phone: process.env.SEED_ADMIN_PHONE || "+992000000000",
        email: process.env.SEED_ADMIN_EMAIL,
        passwordHash,
        role: "ADMIN",
        language: "RU",
      },
    });
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
