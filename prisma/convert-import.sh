#!/bin/bash
# Convert MySQL SQL to PostgreSQL and import to Region table

echo "🌏 Converting and importing wilayah data..."

# Create temp SQL file for PostgreSQL
cat > /tmp/wilayah_import.sql << 'SQLEOF'
-- Clear existing Region data
DELETE FROM "Region";

-- Create temp table
DROP TABLE IF EXISTS wilayah_temp;
CREATE TEMP TABLE wilayah_temp (
    kode varchar(13) NOT NULL,
    nama varchar(100) NOT NULL
);
SQLEOF

# Extract INSERT statements and convert to PostgreSQL format
echo "📂 Extracting INSERT statements..."
grep -E "^\('[0-9]" datawilayah.sql | while read line; do
    echo "INSERT INTO wilayah_temp (kode, nama) VALUES $line;" >> /tmp/wilayah_import.sql
done

# Add migration query
cat >> /tmp/wilayah_import.sql << 'SQLEOF'

-- Migrate to Region table
INSERT INTO "Region" (id, name, level, "parentId", "postalCode", latitude, longitude)
SELECT 
  kode,
  nama,
  CASE 
    WHEN LENGTH(REPLACE(kode, '.', '')) = 2 THEN 'PROVINCE'::"RegionLevel"
    WHEN LENGTH(REPLACE(kode, '.', '')) = 4 THEN 'CITY'::"RegionLevel"
    WHEN LENGTH(REPLACE(kode, '.', '')) = 6 THEN 'DISTRICT'::"RegionLevel"
    ELSE 'VILLAGE'::"RegionLevel"
  END,
  CASE
    WHEN LENGTH(REPLACE(kode, '.', '')) = 2 THEN NULL
    WHEN LENGTH(REPLACE(kode, '.', '')) = 4 THEN SUBSTRING(kode, 1, 2)
    WHEN LENGTH(REPLACE(kode, '.', '')) = 6 THEN SUBSTRING(kode, 1, 5)
    ELSE SUBSTRING(kode, 1, 8)
  END,
  NULL,
  NULL,
  NULL
FROM wilayah_temp
ORDER BY kode;

-- Show stats
SELECT level::text, COUNT(*) as count FROM "Region" GROUP BY level ORDER BY level;
SQLEOF

echo "📍 Importing to PostgreSQL..."
psql -U macbook -d erp_db -f /tmp/wilayah_import.sql

echo "✅ Done!"
