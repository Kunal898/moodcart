-- ============================================================
-- MoodCart - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- ---- PROFILES ----
-- Automatically created when a user registers
-- The trigger below keeps it in sync with auth.users

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ---- CATEGORIES ----
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- PRODUCTS ----
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  mood TEXT CHECK (mood IN ('happy', 'relaxed', 'party', 'work')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- CART ITEMS ----
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ---- ORDERS ----
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- ORDER ITEMS ----
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- WISHLIST ----
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Non-breaking schema enhancements for products
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 1) DEFAULT 4.5;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update only their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: public read
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT USING (true);

-- Products: public read
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT USING (true);

-- Cart: users can only access their own cart items
CREATE POLICY "Users can view their own cart"
  ON cart_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their cart"
  ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart"
  ON cart_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their cart"
  ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Orders: users can only see their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: linked to orders the user owns
CREATE POLICY "Users can view their order items"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

-- Wishlist: users can only access their own wishlist
CREATE POLICY "Users can view their own wishlist"
  ON wishlist FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist"
  ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their wishlist"
  ON wishlist FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Insert categories
INSERT INTO categories (name) VALUES
  ('Electronics'),
  ('Books'),
  ('Food & Beverages'),
  ('Home & Lifestyle'),
  ('Fitness'),
  ('Stationery')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products (you'll need to replace category_id UUIDs after inserting categories)
-- Run: SELECT id, name FROM categories; to get the actual UUIDs

-- NOTE: The INSERT statements below use subqueries to fetch category IDs dynamically.
INSERT INTO products (name, description, price, image_url, category_id, stock, mood) VALUES
  ('Bluetooth Earphones', 'Wireless earphones with deep bass and 20hr battery life. Great for workouts and commutes.', 1299.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/bluetooth-earphones.jpg', (SELECT id FROM categories WHERE name='Electronics'), 50, 'happy'),
  ('The Alchemist', 'Paulo Coelho''s inspiring novel about following your dreams. A timeless read.', 299.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/the-alchemist.jpg', (SELECT id FROM categories WHERE name='Books'), 100, 'relaxed'),
  ('Party Snack Combo', 'A curated mix of chips, nachos, and dips perfect for parties.', 599.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/party-snack-combo.jpg', (SELECT id FROM categories WHERE name='Food & Beverages'), 30, 'party'),
  ('Mechanical Keyboard', 'Tactile mechanical keyboard for programmers. Cherry MX Blue switches.', 4499.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/mechanical-keyboard.jpg', (SELECT id FROM categories WHERE name='Electronics'), 20, 'work'),
  ('Scented Candle Set', 'Set of 4 lavender scented candles for relaxation and ambiance.', 799.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/scented-candle-set.jpg', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 40, 'relaxed'),
  ('Colorful LED Strip Lights', '5m RGB strip lights with remote. Perfect for party decoration.', 999.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/colorful-led-strip-lights.jpg', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 60, 'party'),
  ('Yoga Mat', 'Non-slip 6mm yoga mat with alignment lines. Ideal for home workouts.', 1199.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/yoga-mat.jpg', (SELECT id FROM categories WHERE name='Fitness'), 35, 'relaxed'),
  ('Notebook Set', 'Pack of 3 A5 ruled notebooks with smooth 80gsm pages.', 249.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/notebook-set.jpg', (SELECT id FROM categories WHERE name='Stationery'), 150, 'work'),
  ('Protein Bar Pack', 'Box of 12 chocolate peanut butter protein bars. 20g protein each.', 1499.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/protein-bar-pack.jpg', (SELECT id FROM categories WHERE name='Fitness'), 45, 'happy'),
  ('Instant Coffee Powder', 'Premium blend instant coffee. 200g tin. Rich aroma and smooth taste.', 399.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/instant-coffee-powder.jpg', (SELECT id FROM categories WHERE name='Food & Beverages'), 80, 'work'),
  ('Resistance Bands Set', 'Set of 5 resistance bands with different strengths for home gym.', 699.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/resistance-bands-set.jpg', (SELECT id FROM categories WHERE name='Fitness'), 55, 'happy'),
  ('Disco Ball', 'Mini 10cm rotating disco ball with LED spotlight. Party essential.', 799.00, 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/disco-ball.jpg', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 25, 'party'),
  -- Additional 50 Items Across All Categories and Moods
  ('Noise-Cancelling Wireless Headphones', 'Active noise cancellation with 35hr battery life and plush memory-foam ear cushions. Perfect for deep focus and travel.', 3999.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Electronics'), 45, 'work'),
  ('Portable Waterproof Bluetooth Speaker', 'IPX7 waterproof wireless speaker delivering 360-degree bass. Built for outdoor parties and pool days.', 1799.00, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Electronics'), 35, 'party'),
  ('Sunset Projection Lamp RGB', 'Golden hour aesthetic right in your room. 16 color modes with remote control for relaxation and photography.', 899.00, 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Electronics'), 50, 'relaxed'),
  ('Dual-Wireless Ergonomic Mouse', 'Natural hand-shake posture design reduces wrist strain during long coding and office sessions.', 1199.00, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Electronics'), 40, 'work'),
  ('Studio Ring Light with Tripod Stand', '10-inch dimmable LED ring light with warm/cool modes and universal smartphone mount for creators.', 1299.00, 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Electronics'), 25, 'happy'),
  ('Fast-Charging Power Bank 20000mAh', 'Dual Type-C PD 22.5W high-speed charging bank capable of charging modern laptops and phones on the move.', 1599.00, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Electronics'), 60, 'work'),
  ('Smart AMOLED Fitness Tracker', 'Continuous heart-rate, SpO2, sleep tracking, and 120 sports modes with 14-day battery life.', 2199.00, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Electronics'), 30, 'happy'),
  ('Wireless Karaoke Microphone with Speaker', 'Handheld Bluetooth mic with built-in stereo speaker and voice modifier effects. Instant party starter.', 999.00, 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Electronics'), 20, 'party'),
  ('4K Ultra HD Action Camera', 'Waterproof action cam with electronic image stabilization and wide-angle 170° lens for adventures.', 4999.00, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Electronics'), 15, 'party'),
  ('Ultrasonic Essential Oil Diffuser', '500ml aroma humidifier with ambient warm LED light and automatic shutoff for soothing evenings.', 1399.00, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 40, 'relaxed'),
  ('Chunky Knit Weighted Blanket', 'Hand-knitted breathable cotton weighted blanket designed to relieve anxiety and promote restful sleep.', 3499.00, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 18, 'relaxed'),
  ('Natural Himalayan Pink Salt Lamp', 'Hand-carved authentic salt crystal lamp on wooden base emitting a warm, ion-rich soothing amber glow.', 849.00, 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 50, 'relaxed'),
  ('Automatic Electric Wine Opener Kit', 'Cordless rechargeable corkscrew set with foil cutter, aerator pourer, and vacuum preserver stopper.', 1299.00, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 30, 'party'),
  ('Ceramic Pour-Over Coffee Brewer', 'Artisan handcrafted ceramic dripper with wooden stand for rich, flavorful morning filter coffee.', 699.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 35, 'happy'),
  ('Neon "Good Vibes Only" LED Sign', 'USB-powered vibrant neon acrylic wall art that sets an instant energetic party mood.', 1499.00, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 22, 'party'),
  ('Memory Foam Ergonomic Neck Pillow', 'Orthopedic contoured support pillow for cervical spine alignment and deep restorative sleep.', 1699.00, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 28, 'relaxed'),
  ('Ceramic Succulent Planters Set of 3', 'Minimalist white ceramic planters with bamboo drainage trays for desktop and window greenery.', 549.00, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 45, 'happy'),
  ('Smart Dual RGB Light Bars', 'Sound-sync ambient desk lights with app control and 16M colors for movies, gaming, and parties.', 2499.00, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Home & Lifestyle'), 25, 'party'),
  ('Atomic Habits by James Clear', 'The definitive guide to breaking bad routines and building remarkable tiny habits for extraordinary results.', 499.00, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Books'), 80, 'work'),
  ('Ikigai: The Japanese Secret to Long Life', 'Discover the art of finding your purpose, living peacefully, and bringing joy to everyday rituals.', 349.00, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Books'), 65, 'relaxed'),
  ('Deep Work by Cal Newport', 'Rules for focused success in a distracted world. Master difficult tasks and produce at elite levels.', 420.00, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Books'), 40, 'work'),
  ('The Psychology of Money by Morgan Housel', 'Timeless lessons on wealth, greed, and happiness. How behavior matters far more than mathematical genius.', 399.00, 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Books'), 55, 'work'),
  ('The Comfort Book by Matt Haig', 'A pocket-sized hug of hope, short reflections, and reminders that there is always light at the end of hard days.', 450.00, 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Books'), 35, 'happy'),
  ('Show Your Work! by Austin Kleon', '10 ways to share your creativity and get discovered. Inspiring, practical guide for creators and builders.', 380.00, 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Books'), 45, 'happy'),
  ('The Little Book of Hygge', 'Danish secrets to cozy contentment, comfort food, warm lighting, and savoring simple pleasures.', 499.00, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Books'), 30, 'relaxed'),
  ('Thinking, Fast and Slow by Daniel Kahneman', 'Nobel laureate exploration of the two systems that drive human thinking, judgment, and choices.', 599.00, 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Books'), 25, 'work'),
  ('Ceremonial Japanese Matcha 50g', '100% stone-ground ceremonial green tea powder from Uji, Kyoto. Rich in antioxidants and clean, jitter-free energy.', 899.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Food & Beverages'), 50, 'happy'),
  ('Organic Chamomile Lavender Herbal Tea', 'Whole-flower caffeine-free herbal infusion designed for bedtime relaxation and calm mind.', 399.00, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Food & Beverages'), 60, 'relaxed'),
  ('Artisanal Dark Roast Whole Bean Coffee 250g', 'Single-origin Arabica beans roasted with notes of dark cocoa and toasted hazelnut for deep work mornings.', 549.00, 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Food & Beverages'), 45, 'work'),
  ('Gourmet Himalayan Popcorn Trio Pack', 'Handcrafted non-GMO popcorn seasoned with Himalayan pink salt, caramel, and cheddar cheese.', 349.00, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Food & Beverages'), 70, 'party'),
  ('Cold Brew Coffee Concentrate 500ml', 'Smooth, 16-hour slow-steeped micro-filtered coffee concentrate. Just add cold water or milk over ice.', 449.00, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Food & Beverages'), 35, 'work'),
  ('Raw Forest Wildflower Honey 500g', 'Unprocessed, unfiltered natural honey harvested from remote Himalayan forest reserves.', 499.00, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Food & Beverages'), 40, 'happy'),
  ('Sparkling Artisan Kombucha 4-Pack', 'Naturally fermented sparkling probiotic iced tea with real ginger, passionfruit, and berries.', 649.00, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Food & Beverages'), 30, 'party'),
  ('Dark Chocolate Sea Salt Roasted Almonds 200g', 'California almonds coated in 70% Belgian dark chocolate dusted with flaky Maldon sea salt.', 399.00, 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Food & Beverages'), 55, 'happy'),
  ('Deep Tissue Percussion Massage Gun', 'High-torque brushless motor with 6 massage heads and 30 speed levels for post-workout muscle recovery.', 2799.00, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Fitness'), 25, 'relaxed'),
  ('Eco-Friendly Natural Cork Yoga Mat', 'Anti-microbial, sweat-activated non-slip cork surface with 5mm natural rubber base and carry strap.', 1699.00, 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Fitness'), 35, 'relaxed'),
  ('Adjustable Dumbbells Set (2kg - 10kg)', 'Space-saving home gym dumbbells with textured ergonomic grips and quick-change weight plates.', 3499.00, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Fitness'), 20, 'work'),
  ('Insulated Stainless Steel Shaker 750ml', 'Double-walled vacuum insulated protein shaker keeps shakes ice cold for 24 hours with leakproof seal.', 799.00, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Fitness'), 45, 'happy'),
  ('High-Density Foam Roller for Recovery', 'Targeted myofascial release roller relieves back tightness, leg soreness, and boosts circulation.', 899.00, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Fitness'), 40, 'relaxed'),
  ('Speed Jump Rope with Ball Bearings', 'Tangle-free steel cable jump rope for high-cadence cardio, boxing conditioning, and agility training.', 499.00, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Fitness'), 60, 'happy'),
  ('Weightlifting Wrist Wraps & Grips Pair', 'Heavy-duty thumb loop wrist braces providing maximum joint stability for heavy deadlifts and presses.', 599.00, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Fitness'), 30, 'work'),
  ('Acupressure Mat & Pillow Set', 'Thousands of stimulation points promote endorphin release, relieve muscular tension, and melt stress.', 1399.00, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Fitness'), 25, 'relaxed'),
  ('Hardcover Dotted Bullet Journal (160 GSM)', 'Bleed-resistant ultra-thick bamboo paper with numbered pages, inner pocket, and lay-flat binding.', 599.00, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Stationery'), 75, 'work'),
  ('Solid Brass Minimalist Fountain Pen', 'Balanced heavyweight brass body with fine German iridium nib for butter-smooth handwriting.', 1299.00, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Stationery'), 30, 'work'),
  ('Pastel Aesthetic Dual-Tip Highlighters 6-Pack', 'Soft pastel non-fluorescent colors gentle on the eyes with both chisel and fine bullet tips.', 349.00, 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Stationery'), 80, 'happy'),
  ('Ergonomic Felt Large Desk Pad (90x40cm)', 'Water-resistant natural wool felt desk blotter provides cushion for wrists and protects desktop.', 899.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Stationery'), 40, 'work'),
  ('Sticky Notes & Page Flags Aesthetic Set', 'Color-palette coordinated translucent sticky tabs and memo pads for studying and organizing.', 299.00, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Stationery'), 90, 'work'),
  ('Undated Daily Productivity Planner', '90-day daily breakdown with priority matrices, habit tracking, and evening reflection prompts.', 499.00, 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Stationery'), 50, 'happy'),
  ('Japanese Calligraphy Brush Pens Set of 12', 'Flexible nylon brush tips with water-based blendable ink for lettering, sketching, and watercolor art.', 699.00, 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Stationery'), 35, 'relaxed'),
  ('Natural Walnut Wood Phone & Pen Stand', 'Solid handcrafted American walnut organizer keeps your charging phone and favorite pen in easy reach.', 749.00, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', (SELECT id FROM categories WHERE name='Stationery'), 25, 'work');

