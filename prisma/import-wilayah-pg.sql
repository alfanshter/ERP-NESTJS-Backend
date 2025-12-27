-- Import wilayah data ke table Region
-- Run: psql -U macbook -d erp_db -f prisma/import-wilayah-pg.sql

-- Clear existing data
DELETE FROM "Region";

-- Create temp table with MySQL-compatible structure
CREATE TEMP TABLE wilayah_temp (
    kode varchar(13) NOT NULL,
    nama varchar(100) NOT NULL
);

-- We'll insert data via script below
