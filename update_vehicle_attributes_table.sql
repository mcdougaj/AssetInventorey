-- Update vehicle_attributes table to include all fields and notes
-- Run this in your Supabase SQL Editor

-- First, add the missing columns to the existing table
ALTER TABLE vehicle_attributes 
ADD COLUMN IF NOT EXISTS trim VARCHAR(100),
ADD COLUMN IF NOT EXISTS engine VARCHAR(200),
ADD COLUMN IF NOT EXISTS transmission VARCHAR(100),
ADD COLUMN IF NOT EXISTS body_class VARCHAR(100),
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS plant_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS plant_company VARCHAR(200),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS decode_status VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS decoded_at TIMESTAMP WITH TIME ZONE;

-- Update the updated_at column to have a trigger for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_vehicle_attributes_updated_at ON vehicle_attributes;
CREATE TRIGGER update_vehicle_attributes_updated_at
    BEFORE UPDATE ON vehicle_attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the new fields
COMMENT ON COLUMN vehicle_attributes.notes IS 'User notes, VIN decode errors, or other important information about vehicle attributes';
COMMENT ON COLUMN vehicle_attributes.decode_status IS 'Status of VIN decode: manual, success, error, partial';
COMMENT ON COLUMN vehicle_attributes.decoded_at IS 'Timestamp when VIN was last decoded';

-- Verify the updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'vehicle_attributes' 
ORDER BY ordinal_position;

SELECT 'vehicle_attributes table updated successfully!' as status;
