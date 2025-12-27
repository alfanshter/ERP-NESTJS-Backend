const { Client } = require('pg');
const fs = require('fs');

async function main() {
  console.log('🌏 Importing Indonesia regions...');
  
  const client = new Client({
    connectionString: 'postgresql://macbook@localhost:5432/erp_db?schema=public'
  });
  
  await client.connect();
  console.log('📂 Connected to database');
  
  // Read SQL file
  const sql = fs.readFileSync('datawilayah.sql', 'utf-8');
  
  // Parse all values
  const regex = /\('([^']+)','([^']+)'\)/g;
  const data = [];
  let match;
  while ((match = regex.exec(sql)) !== null) {
    data.push({ kode: match[1], nama: match[2] });
  }
  console.log(`🔍 Found ${data.length} regions`);
  
  // Clear existing
  console.log('🗑️  Clearing existing data...');
  await client.query('DELETE FROM "Region"');
  
  // Insert
  console.log('📍 Inserting regions...');
  let count = 0;
  
  for (const item of data) {
    const kodeClean = item.kode.replace(/\./g, '');
    let level, parentId;
    
    if (kodeClean.length === 2) {
      level = 'PROVINCE';
      parentId = null;
    } else if (kodeClean.length === 4) {
      level = 'CITY';
      parentId = item.kode.substring(0, 2);
    } else if (kodeClean.length === 6) {
      level = 'DISTRICT';
      parentId = item.kode.substring(0, 5);
    } else {
      level = 'VILLAGE';
      parentId = item.kode.substring(0, 8);
    }
    
    try {
      await client.query(
        `INSERT INTO "Region" (id, name, level, "parentId") VALUES ($1, $2, $3::\"RegionLevel\", $4)`,
        [item.kode, item.nama, level, parentId]
      );
      count++;
      if (count % 5000 === 0) {
        console.log(`   Progress: ${count}/${data.length}`);
      }
    } catch (err) {
      console.error(`Error: ${item.kode} - ${err.message}`);
    }
  }
  
  // Stats
  const stats = await client.query(`
    SELECT level::text, COUNT(*) as count 
    FROM "Region" 
    GROUP BY level 
    ORDER BY level
  `);
  
  console.log('\n📊 Summary:');
  let total = 0;
  for (const row of stats.rows) {
    console.log(`   ${row.level}: ${row.count}`);
    total += parseInt(row.count);
  }
  console.log(`   TOTAL: ${total}`);
  
  await client.end();
  console.log('\n✅ Import completed!');
}

main().catch(console.error);
