const supabase = require('../config/supabase');
const { createClient } = require('@supabase/supabase-js');

// Anon client for generating user JWT sessions
const anonClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Register a user and IMMEDIATELY approve/confirm their email
 * (Bypasses Supabase email confirmation requirement completely)
 */
async function register(req, res) {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (fullName || 'MoodCart Shopper').trim();

    // Check if user already exists
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existing = userList?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    let targetUser;

    if (existing) {
      // Auto-approve, confirm email, and update password
      const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(
        existing.id,
        {
          email_confirm: true,
          password: password,
          user_metadata: {
            full_name: cleanName,
            role: existing.user_metadata?.role || 'customer',
          },
        }
      );

      if (updateErr) throw updateErr;
      targetUser = updated.user;
    } else {
      // Create user with email_confirm: true (AUTO-APPROVED INSTANTLY)
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: cleanName,
          role: 'customer',
        },
      });

      if (createErr) throw createErr;
      targetUser = created.user;
    }

    // Ensure profile entry exists
    if (targetUser?.id) {
      await supabase.from('profiles').upsert({
        id: targetUser.id,
        full_name: cleanName,
        role: targetUser.user_metadata?.role || 'customer',
      });
    }

    // Generate active session for instant login
    const { data: sessionData, error: sessionErr } = await anonClient.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    res.status(201).json({
      success: true,
      message: 'Account created and auto-approved successfully!',
      user: targetUser,
      session: sessionData?.session || null,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Failed to register account' });
  }
}

/**
 * Auto-approve / confirm an existing email address
 */
async function autoApprove(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: updated, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (error) throw error;

    res.json({
      success: true,
      message: `User ${cleanEmail} has been auto-approved and confirmed.`,
      user: updated.user,
    });
  } catch (err) {
    console.error('Auto-approve error:', err);
    res.status(500).json({ error: err.message || 'Failed to auto-approve user' });
  }
}

/**
 * Login handler with automatic unconfirmed email bypass
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // First attempt to sign in
    let { data, error } = await anonClient.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    // If Supabase complains about unconfirmed email, auto-confirm and retry immediately
    if (error && (error.message?.toLowerCase().includes('confirm') || error.status === 400)) {
      const { data: userList } = await supabase.auth.admin.listUsers();
      const user = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

      if (user) {
        // Auto-approve and confirm now
        await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });

        // Retry login
        const retryResult = await anonClient.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        data = retryResult.data;
        error = retryResult.error;
      }
    }

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
}

/**
 * Approve ALL existing users currently in the database
 */
async function approveAllUsers(req, res) {
  try {
    const { data: userList, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const unconfirmed = userList.users.filter((u) => !u.email_confirmed_at);
    const results = [];

    for (const u of unconfirmed) {
      const { data: updated } = await supabase.auth.admin.updateUserById(u.id, {
        email_confirm: true,
      });
      results.push(updated?.user?.email);
    }

    res.json({
      success: true,
      totalUsers: userList.users.length,
      autoApprovedCount: results.length,
      approvedEmails: results,
      message: `All ${userList.users.length} users are confirmed and approved.`,
    });
  } catch (err) {
    console.error('Approve all error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  register,
  autoApprove,
  login,
  approveAllUsers,
};
