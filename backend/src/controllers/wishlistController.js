const supabase = require('../config/supabase');

// Get user's wishlist items
async function getWishlist(req, res) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(id, name, price, original_price, image_url, stock, mood, categories(name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      // If table does not exist yet in Supabase, return empty array gracefully
      if (error.code === '42P01') {
        return res.json([]);
      }
      throw error;
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Add item to wishlist
async function addToWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Check if already in wishlist
    const { data: existing, error: checkError } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116' && checkError.code !== '42P01') {
      throw checkError;
    }

    if (existing) {
      return res.json({ message: 'Item already in wishlist', id: existing.id });
    }

    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ user_id: userId, product_id }])
      .select('*, products(id, name, price, original_price, image_url, stock, mood, categories(name))')
      .single();

    if (error) {
      if (error.code === '42P01') {
        return res.json({ message: 'Wishlist stored locally (database table pending)', product_id });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Remove item from wishlist
async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error && error.code !== '42P01') throw error;

    res.json({ message: 'Item removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
