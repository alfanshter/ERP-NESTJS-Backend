/**
 * Seed script untuk import data wilayah Indonesia LENGKAP
 *
 * Data source: https://github.com/cahyadsn/wilayah
 * Format kode wilayah Indonesia:
 * - Provinsi: XX (2 digit)
 * - Kota/Kabupaten: XX.XX (5 karakter)
 * - Kecamatan: XX.XX.XX (8 karakter)
 * - Kelurahan/Desa: XX.XX.XX.XXXX (13 karakter)
 *
 * Usage: npx tsx prisma/seed-regions.ts
 */

import { PrismaClient } from '@prisma/client';
import * as https from 'https';
import * as http from 'http';

const prisma = new PrismaClient();

// Region level enum (must match Prisma schema)
enum RegionLevel {
  PROVINCE = 'PROVINCE',
  CITY = 'CITY',
  DISTRICT = 'DISTRICT',
  VILLAGE = 'VILLAGE',
}

interface WilayahData {
  kode: string;
  nama: string;
}

/**
 * Determine region level based on code format
 */
function getRegionLevel(kode: string): RegionLevel {
  const parts = kode.split('.');
  switch (parts.length) {
    case 1:
      return RegionLevel.PROVINCE;
    case 2:
      return RegionLevel.CITY;
    case 3:
      return RegionLevel.DISTRICT;
    case 4:
      return RegionLevel.VILLAGE;
    default:
      return RegionLevel.VILLAGE;
  }
}

/**
 * Get parent ID from region code
 */
function getParentId(kode: string): string | null {
  const parts = kode.split('.');
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join('.');
}

/**
 * Fetch data from URL
 */
function fetchData(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol
      .get(url, (res) => {
        // Handle redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            fetchData(redirectUrl).then(resolve).catch(reject);
            return;
          }
        }

        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

/**
 * Parse CSV data into WilayahData array
 */
function parseCSV(csvData: string): WilayahData[] {
  const lines = csvData.split('\n');
  const result: WilayahData[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Skip header
    const line = lines[i].trim();
    if (!line) continue;

    // Format: kode,nama
    const match = line.match(/^"?([^",]+)"?,\s*"?([^"]+)"?$/);
    if (match) {
      result.push({
        kode: match[1].trim(),
        nama: match[2].trim(),
      });
    } else {
      // Try simple comma split
      const parts = line.split(',');
      if (parts.length >= 2) {
        result.push({
          kode: parts[0].trim().replace(/"/g, ''),
          nama: parts.slice(1).join(',').trim().replace(/"/g, ''),
        });
      }
    }
  }

  return result;
}

/**
 * Main seeding function
 */
async function main() {
  console.log('🌏 Seeding Indonesia regions data (FULL)...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing regions...');
  await prisma.region.deleteMany();

  // CSV URLs from cahyadsn/wilayah repository
  const baseUrl =
    'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/csv';
  const files = [
    { name: 'provinces', url: `${baseUrl}/provinces.csv`, level: 'Provinsi' },
    { name: 'regencies', url: `${baseUrl}/regencies.csv`, level: 'Kota/Kab' },
    { name: 'districts', url: `${baseUrl}/districts.csv`, level: 'Kecamatan' },
    { name: 'villages', url: `${baseUrl}/villages.csv`, level: 'Kelurahan' },
  ];

  let totalInserted = 0;

  for (const file of files) {
    console.log(`\n📥 Downloading ${file.level}...`);

    try {
      const csvData = await fetchData(file.url);
      const records = parseCSV(csvData);

      console.log(`   Found ${records.length} records`);
      console.log(`   📍 Inserting ${file.level}...`);

      // Batch insert for better performance
      const batchSize = 1000;
      let inserted = 0;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        const data = batch.map((record) => ({
          id: record.kode,
          name: record.nama,
          level: getRegionLevel(record.kode),
          parentId: getParentId(record.kode),
        }));

        await prisma.region.createMany({
          data,
          skipDuplicates: true,
        });

        inserted += batch.length;
        process.stdout.write(
          `\r   ✅ Inserted ${inserted}/${records.length} ${file.level}`,
        );
      }

      totalInserted += records.length;
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error processing ${file.name}:`, error);
    }
  }

  // Get statistics
  console.log('\n📊 Final Statistics:');
  const stats = await prisma.region.groupBy({
    by: ['level'],
    _count: true,
  });

  stats.forEach((stat) => {
    const label =
      {
        PROVINCE: 'Provinsi',
        CITY: 'Kota/Kabupaten',
        DISTRICT: 'Kecamatan',
        VILLAGE: 'Kelurahan/Desa',
      }[stat.level] || stat.level;
    console.log(`   ${label}: ${stat._count.toLocaleString()}`);
  });

  console.log(`\n   Total: ${totalInserted.toLocaleString()} wilayah`);
  console.log('\n✅ Region seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding regions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
