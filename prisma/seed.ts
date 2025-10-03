import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.subscriptionPlan.createMany({
    data: [
      { name: 'Free', monthlyCredits: 20, price: 0, showAds: true },
      { name: 'Plus', monthlyCredits: 50, price: 9.99, showAds: false },
      { name: 'Expert', monthlyCredits: 100, price: 19.99, showAds: false },
      { name: 'Pro', monthlyCredits: -1, price: 29.99, showAds: false }, // -1 = ilimitado
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log('✅ Planes insertados correctamente');
  })
  .catch((e) => {
    console.error('❌ Error insertando planes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
