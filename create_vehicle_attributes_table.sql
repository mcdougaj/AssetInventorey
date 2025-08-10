-- Create vehicle_attributes table for VIN decoder data
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS vehicle_attributes (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    vin VARCHAR(17) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_attributes_asset_id ON vehicle_attributes(asset_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_attributes_vin ON vehicle_attributes(vin);

-- Enable Row Level Security (RLS) to match your existing security setup
ALTER TABLE vehicle_attributes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow authenticated users (same as your assets table)
CREATE POLICY "Enable all operations for authenticated users" ON vehicle_attributes
    FOR ALL USING (auth.role() = 'authenticated');

-- Verify table was created
SELECT 'vehicle_attributes table created successfully!' as status;
