-- Create categories table for dynamic asset categorization
-- This replaces hardcoded categories in the Asset Inventory app

CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code for UI
    icon VARCHAR(50) DEFAULT '📦', -- Emoji or icon identifier
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0, -- For custom ordering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own categories
CREATE POLICY "Users can view their own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own categories
CREATE POLICY "Users can insert their own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own categories
CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own categories
CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Insert default categories for new users (these will be copied per user)
INSERT INTO categories (name, description, color, icon, sort_order, user_id) VALUES
    ('Electronics', 'Computers, phones, tablets, and electronic devices', '#3B82F6', '💻', 1, NULL),
    ('Vehicles', 'Cars, trucks, motorcycles, and transportation equipment', '#EF4444', '🚗', 2, NULL),
    ('Furniture', 'Office and home furniture, chairs, desks, tables', '#10B981', '🪑', 3, NULL),
    ('Tools & Equipment', 'Hand tools, power tools, machinery, and equipment', '#F59E0B', '🔧', 4, NULL),
    ('Office Supplies', 'Printers, scanners, office equipment, and supplies', '#8B5CF6', '🖨️', 5, NULL),
    ('Safety Equipment', 'Safety gear, protective equipment, and emergency supplies', '#F97316', '🦺', 6, NULL),
    ('IT Infrastructure', 'Servers, networking equipment, cables, and IT hardware', '#06B6D4', '🖥️', 7, NULL),
    ('Medical Equipment', 'Medical devices, healthcare equipment, and supplies', '#EC4899', '🏥', 8, NULL)
ON CONFLICT (name) DO NOTHING;

-- Function to copy default categories for new users
CREATE OR REPLACE FUNCTION copy_default_categories_for_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Copy default categories (where user_id is NULL) for the new user
    INSERT INTO categories (name, description, color, icon, sort_order, user_id)
    SELECT name, description, color, icon, sort_order, NEW.id
    FROM categories 
    WHERE user_id IS NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create default categories for new users
CREATE OR REPLACE TRIGGER trigger_copy_default_categories
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION copy_default_categories_for_user();

-- Update the assets table to reference categories table
-- Add foreign key constraint to link assets to categories
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for the foreign key
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);

-- Update existing assets to use category IDs (optional migration)
-- This will need to be run after categories are populated
-- UPDATE assets SET category_id = (SELECT id FROM categories WHERE name = assets.category LIMIT 1);

-- Add a view for easy category management
CREATE OR REPLACE VIEW user_categories AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.color,
    c.icon,
    c.is_active,
    c.sort_order,
    c.created_at,
    c.updated_at,
    COUNT(a.id) as asset_count
FROM categories c
LEFT JOIN assets a ON c.id = a.category_id
WHERE c.user_id = auth.uid() AND c.is_active = true
GROUP BY c.id, c.name, c.description, c.color, c.icon, c.is_active, c.sort_order, c.created_at, c.updated_at
ORDER BY c.sort_order, c.name;

COMMENT ON TABLE categories IS 'Dynamic categories for asset classification - replaces hardcoded categories';
COMMENT ON VIEW user_categories IS 'User-specific categories with asset counts for easy management';
