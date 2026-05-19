import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.leadAssignment.deleteMany({});
  await prisma.roundRobinTracker.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.processedWebhook.deleteMany({});

  console.log('Seeding Services...');
  const services = [
    { id: 'service-1', name: 'Service 1' },
    { id: 'service-2', name: 'Service 2' },
    { id: 'service-3', name: 'Service 3' },
  ];
  for (const s of services) {
    await prisma.service.create({ data: s });
  }

  console.log('Seeding Providers...');
  const providers = [
    { id: 'provider-1', name: 'Provider 1', quota: 10 },
    { id: 'provider-2', name: 'Provider 2', quota: 10 },
    { id: 'provider-3', name: 'Provider 3', quota: 10 },
    { id: 'provider-4', name: 'Provider 4', quota: 10 },
    { id: 'provider-5', name: 'Provider 5', quota: 10 },
    { id: 'provider-6', name: 'Provider 6', quota: 10 },
    { id: 'provider-7', name: 'Provider 7', quota: 10 },
    { id: 'provider-8', name: 'Provider 8', quota: 10 },
  ];
  for (const p of providers) {
    await prisma.provider.create({ data: p });
  }

  console.log('Initializing RoundRobinTracker...');
  const trackers = [
    { serviceId: 'service-1', lastProviderId: null },
    { serviceId: 'service-2', lastProviderId: null },
    { serviceId: 'service-3', lastProviderId: null },
  ];
  for (const t of trackers) {
    await prisma.roundRobinTracker.create({ data: t });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
