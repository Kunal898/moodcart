const supabase = require('../config/supabase');

async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, address, city, pincode, items } = req.body;

    if (!name || !phone || !address || !city || !pincode || !items || items.length === 0) {
      return res.status(400).json({ error: 'All delivery details and items are required' });
    }

    // Security & Inventory check: Fetch real products from DB to validate stock and compute authoritative total
    const productIds = items.map((i) => i.product_id);
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .in('id', productIds);

    if (prodError) throw prodError;

    const productMap = new Map();
    dbProducts.forEach((p) => productMap.set(p.id, p));

    // Validate existence and stock
    for (const item of items) {
      const dbProduct = productMap.get(item.product_id);
      if (!dbProduct) {
        return res.status(400).json({ error: `Product not found: ${item.product_id}` });
      }
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} left in stock.`
        });
      }
    }

    // Authoritative total calculated strictly on the backend
    const total = items.reduce((sum, item) => {
      const dbProduct = productMap.get(item.product_id);
      return sum + Number(dbProduct.price) * item.quantity;
    }, 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        name,
        phone,
        address,
        city,
        pincode,
        total,
        status: 'pending',
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items with verified database prices
    const orderItems = items.map((item) => {
      const dbProduct = productMap.get(item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: dbProduct.price,
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Decrement stock for purchased products
    for (const item of items) {
      const dbProduct = productMap.get(item.product_id);
      const newStock = Math.max(0, dbProduct.stock - item.quantity);
      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.product_id);
    }

    // Clear user's cart
    await supabase.from('cart_items').delete().eq('user_id', userId);

    res.status(201).json({ ...order, order_items: orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrders(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.user_metadata?.role;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url))')
      .order('created_at', { ascending: false });

    // Admins see all orders, customers see only their own
    if (role !== 'admin') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrderById(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.user_metadata?.role;
    const { id } = req.params;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url, price))')
      .eq('id', id)
      .single();

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });

    // Customers can only view their own orders
    if (role !== 'admin' && data.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Admin Dashboard stats summary
async function getDashboardStats(req, res) {
  try {
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('id, stock');
    if (pErr) throw pErr;

    const { data: orders, error: oErr } = await supabase
      .from('orders')
      .select('id, total, status');
    if (oErr) throw oErr;

    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter((p) => p.stock <= 5).length || 0;
    const outOfStockProducts = products?.filter((p) => p.stock === 0).length || 0;

    const totalOrders = orders?.length || 0;
    const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0;
    const totalRevenue = orders
      ?.filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

    res.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getDashboardStats };
