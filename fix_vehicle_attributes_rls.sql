-- Fix RLS policy for vehicle_attributes table
-- Run this in your Supabase SQL Editor

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON vehicle_attributes;

-- Create a more permissive policy that matches your assets table setup
CREATE POLICY "Allow all operations for authenticated users" ON vehicle_attributes
    FOR ALL USING (true);

-- Alternative: If you want to match exactly how your assets table works,
-- you can also try this policy instead:
-- CREATE POLICY "Allow all operations for authenticated users" ON vehicle_attributes
--     FOR ALL USING (auth.uid() IS NOT NULL);

-- Verify the policy was created
SELECT 'RLS policy fixed for vehicle_attributes!' as status;
