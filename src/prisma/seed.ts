import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma: PrismaClient = new PrismaClient({ adapter });

async function main() {
  console.log('--- Starting Seed: Dodowa - Accra Corridor ---');

  // 1. Create the Admin, Driver, and Mate
  const admin = await prisma.user.upsert({
    where: { phone: '0240000001' },
    update: {},
    create: {
      phone: '0240000001',
      fullName: 'System Admin',
      password: 'password123', // In real app, use bcrypt
      role: 'ADMIN',
    },
  });

  const samuel = await prisma.user.upsert({
    where: { phone: '0240000002' },
    update: {},
    create: {
      phone: '0240000002',
      fullName: 'Samuel Nii Laryea',
      password: 'password123',
      role: 'DRIVER',
    },
  });

  // 2. Create the Vehicle
  const bus = await prisma.vehicle.upsert({
    where: { plateNumber: 'GS-1234-23' },
    update: {},
    create: {
      plateNumber: 'GS-1234-23',
      capacity: 15, // Sprinter
      model: 'Mercedes Sprinter',
      ownerId: samuel.id,
    },
  });

  // 3. Create Physical Stops (Waypoints)
  const stopsData = [
    { name: 'Dodowa Terminal', lat: 5.8821, lng: -0.1044 },
    { name: 'Oyibi Junction', lat: 5.8115, lng: -0.1341 },
    { name: 'Valley View University', lat: 5.7951, lng: -0.1432 },
    { name: 'Adenta Barrier', lat: 5.7061, lng: -0.1601 },
    { name: 'Madina Oman FM', lat: 5.6698, lng: -0.1683 },
    { name: 'Legon Presec', lat: 5.6511, lng: -0.1751 },
    { name: 'Accra Central', lat: 5.5458, lng: -0.2079 },
  ];

  const createdStops: { id: number; name: string; latitude: number; longitude: number; }[] = [];
  for (const s of stopsData) {
    const stop = await prisma.stop.upsert({
      where: { id: stopsData.indexOf(s) + 1 }, // Simple ID mapping for seed
      update: {},
      create: {
        name: s.name,
        latitude: s.lat,
        longitude: s.lng,
      },
    });
    createdStops.push(stop);
  }

  // 4. Create the Route
  const route = await prisma.route.create({
    data: {
      name: 'Dodowa - Accra Central (via Madina)',
    },
  });

  // 5. Link Stops to Route in Sequence
  // We use estTimeFromStart to simulate the morning commute
  const routeStops = [
    { stopId: createdStops[0].id, seq: 1, time: 0 },   // Dodowa
    { stopId: createdStops[1].id, seq: 2, time: 15 },  // Oyibi
    { stopId: createdStops[2].id, seq: 3, time: 22 },  // Valley View
    { stopId: createdStops[3].id, seq: 4, time: 40 },  // Adenta
    { stopId: createdStops[4].id, seq: 5, time: 55 },  // Madina
    { stopId: createdStops[5].id, seq: 6, time: 65 },  // Legon
    { stopId: createdStops[6].id, seq: 7, time: 90 },  // Accra Central
  ];

  for (const rs of routeStops) {
    await prisma.routeStop.create({
      data: {
        routeId: route.id,
        stopId: rs.stopId,
        sequence: rs.seq,
        estTimeFromStart: rs.time,
      },
    });
  }

  console.log('--- Seed Complete: Ready for Vibe Coding ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });