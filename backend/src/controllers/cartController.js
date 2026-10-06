const supabase = require('../config/supabase');

async function getCart(req, res) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(id, name, price, image_url, stock)')
      .eq('user_id', userId);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'product_id and quantity are required' });
    }

    // Check if item already exists in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select('*, products(id, name, price, image_url, stock)')
        .single();

      if (error) throw error;
      return res.json(data);
    }

    // Insert new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id, quantity }])
      .select('*, products(id, name, price, image_url, stock)')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateCartItem(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, products(id, name, price, image_url, stock)')
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cart item not found' });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function removeFromCart(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
