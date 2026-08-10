const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.borrowing.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.event.deleteMany();

  const hashedPassword = await bcrypt.hash('password', 10);

  // Seed Users
  const admin = await prisma.user.create({
    data: {
      name: 'Administrator System',
      email: 'admin@rental.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        create: {
          phoneNumber: '081234567890',
          address: 'Kantor Pusat Rental Kostum',
          heightCm: 170,
          weightKg: 65,
          chestSizeCm: 95,
          waistSizeCm: 80,
        },
      },
    },
  });

  const budi = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@mail.com',
      password: hashedPassword,
      role: 'user',
      profile: {
        create: {
          phoneNumber: '089876543210',
          address: 'Jl. Mawar No. 12, Bandung',
          heightCm: 175,
          weightKg: 70,
          chestSizeCm: 98,
          waistSizeCm: 82,
        },
      },
    },
  });

  console.log('✅ Users seeded:', { admin: admin.email, budi: budi.email });

  // Seed Units
  const units = await Promise.all([
    prisma.unit.create({
      data: {
        code: 'KST-NR-001',
        name: 'Kostum Naruto Sage Mode',
        sizeCategory: 'L',
        recommendedHeightMin: 170,
        recommendedHeightMax: 180,
        description: 'Bahan lembut, termasuk jubah & aksesoris',
        status: 'available',
      },
    }),
    prisma.unit.create({
      data: {
        code: 'KST-NR-002',
        name: 'Kostum Naruto Sage Mode',
        sizeCategory: 'XL',
        recommendedHeightMin: 178,
        recommendedHeightMax: 188,
        description: 'Lengkap dengan jubah, wig, dan celana',
        status: 'available',
      },
    }),
    prisma.unit.create({
      data: {
        code: 'KST-SP-001',
        name: 'Kostum Spider-Man Cosplay',
        sizeCategory: 'M',
        recommendedHeightMin: 160,
        recommendedHeightMax: 172,
        description: 'Bahan elastis, full costume',
        status: 'available',
      },
    }),
    prisma.unit.create({
      data: {
        code: 'KST-AK-001',
        name: 'Kostum Akatsuki Cloak',
        sizeCategory: 'L',
        recommendedHeightMin: 168,
        recommendedHeightMax: 180,
        description: 'Jubah Akatsuki dengan motif awan merah, bahan tebal',
        status: 'available',
      },
    }),
    prisma.unit.create({
      data: {
        code: 'KST-DN-001',
        name: 'Kostum Demon Slayer Tanjiro',
        sizeCategory: 'M',
        recommendedHeightMin: 158,
        recommendedHeightMax: 170,
        description: 'Set lengkap dengan haori dan earrings',
        status: 'available',
      },
    }),
    prisma.unit.create({
      data: {
        code: 'KST-OP-001',
        name: 'Kostum One Piece Luffy',
        sizeCategory: 'S',
        recommendedHeightMin: 150,
        recommendedHeightMax: 162,
        description: 'Vest merah, celana jeans, dan topi jerami',
        status: 'available',
      },
    }),
    prisma.unit.create({
      data: {
        code: 'KST-JK-001',
        name: 'Kostum Jujutsu Kaisen Gojo',
        sizeCategory: 'XL',
        recommendedHeightMin: 178,
        recommendedHeightMax: 190,
        description: 'Seragam Jujutsu Tech dengan blindfold',
        status: 'available',
      },
    }),
    prisma.unit.create({
      data: {
        code: 'KST-AO-001',
        name: 'Kostum Attack on Titan Survey Corps',
        sizeCategory: 'M',
        recommendedHeightMin: 160,
        recommendedHeightMax: 175,
        description: 'Jaket Survey Corps dengan emblem sayap kebebasan',
        status: 'available',
      },
    }),
    prisma.unit.create({
      data: {
        code: 'KST-MH-001',
        name: 'Kostum My Hero Academia Deku',
        sizeCategory: 'L',
        recommendedHeightMin: 166,
        recommendedHeightMax: 178,
        description: 'Kostum hero full body suit hijau',
        status: 'available',
      },
    }),
    prisma.unit.create({
      data: {
        code: 'KST-GN-001',
        name: 'Kostum Genshin Impact Zhongli',
        sizeCategory: 'XXL',
        recommendedHeightMin: 180,
        recommendedHeightMax: 195,
        description: 'Set formal dengan aksesoris geo',
        status: 'available',
      },
    }),
  ]);

  console.log(`✅ Units seeded: ${units.length} kostum`);

  // Seed Events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Comic Frontier 19 (Comifuro)',
        location: 'ICE BSD, Tangerang',
        startDate: new Date('2026-09-18'),
        endDate: new Date('2026-09-20'),
        description: 'Festival komik dan pop culture terbesar',
      },
    }),
    prisma.event.create({
      data: {
        title: 'Bandung Wibu Festival',
        location: 'Braga City Walk, Bandung',
        startDate: new Date('2026-10-02'),
        endDate: new Date('2026-10-03'),
        description: 'Gathering cosplayer regional Bandung',
      },
    }),
    prisma.event.create({
      data: {
        title: 'Indonesia Comic Con 2026',
        location: 'JCC Senayan, Jakarta',
        startDate: new Date('2026-11-15'),
        endDate: new Date('2026-11-17'),
        description: 'Event comic dan cosplay terbesar se-Indonesia',
      },
    }),
  ]);

  console.log(`✅ Events seeded: ${events.length} events`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('Login credentials:');
  console.log('  Admin: admin@rental.com / password');
  console.log('  User:  budi@mail.com / password');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
