const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

async function createMember(request, env) {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;

  if (!supabaseUrl || !env.SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      !supabaseUrl ? 'SUPABASE_URL' : null,
      !env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    ].filter(Boolean);

    return json(
      {
        error: 'Server Supabase credentials are not configured.',
        missing,
        hint: 'These must be configured as runtime Worker bindings, not Workers Build variables.',
      },
      500
    );
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'Authentication required.' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const {
    first_name,
    last_name,
    rank,
    cadet365_email,
    instrument,
    role,
    phone,
    temporary_password,
  } = body || {};

  if (!first_name || !last_name || !cadet365_email) {
    return json(
      { error: 'First name, last name, and email are required.' },
      400
    );
  }

  const serviceHeaders = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };

  const callerResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: authorization,
    },
  });

  if (!callerResponse.ok) {
    return json({ error: 'Invalid or expired Supabase session.' }, 401);
  }

  const caller = await callerResponse.json();

  const callerProfileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(caller.id)}&select=id,role&limit=1`,
    { headers: serviceHeaders }
  );

  if (!callerProfileResponse.ok) {
    return json({ error: 'Could not verify administrator permissions.' }, 500);
  }

  const callerProfiles = await callerProfileResponse.json();
  if (!callerProfiles[0] || callerProfiles[0].role !== 'admin') {
    return json({ error: 'Unauthorized: Admin role required.' }, 403);
  }

  const temporaryPassword = String(temporary_password || '');

  if (temporaryPassword.length < 8) {
    return json({ error: 'An initial password of at least 8 characters is required.' }, 400);
  }

  const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: serviceHeaders,
    body: JSON.stringify({
      email: String(cadet365_email).trim().toLowerCase(),
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        rank: rank || 'Cdt',
        instrument: instrument || 'Clarinet 1',
        role: role || 'member',
        phone: phone || null,
        must_change_password: true,
      },
    }),
  });

  const authResult = await authResponse.json();

  if (!authResponse.ok || !authResult.id) {
    return json(
      {
        error:
          authResult.msg ||
          authResult.message ||
          'Could not create Supabase Auth user.',
      },
      authResponse.status || 400
    );
  }

  // The Supabase on_auth_user_created trigger already creates this profile.
  // Update that row instead of inserting a second row with the same UUID.
  const profile = {
    id: authResult.id,
    first_name: String(first_name).trim(),
    last_name: String(last_name).trim(),
    rank: rank || 'Cdt',
    cadet365_email: String(cadet365_email).trim().toLowerCase(),
    instrument: instrument || 'Clarinet 1',
    role: role || 'member',
    phone: phone ? String(phone).trim() : null,
  };

  const profileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(authResult.id)}`,
    {
      method: 'PATCH',
      headers: {
        ...serviceHeaders,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(profile),
    }
  );

  const profileResult = await profileResponse.json().catch(() => ({}));

  if (!profileResponse.ok || !Array.isArray(profileResult) || !profileResult[0]) {
    await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(authResult.id)}`,
      { method: 'DELETE', headers: serviceHeaders }
    );

    return json(
      {
        error:
          profileResult?.message ||
          profileResult?.msg ||
          'Auth user was created, but the profile could not be updated.',
      },
      profileResponse.status || 500
    );
  }

  return json({ profile: profileResult[0] }, 201);
}

async function updateMemberAuth(request, env) {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  if (!supabaseUrl || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'Server Supabase credentials are not configured.' }, 500);
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication required.' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request body.' }, 400); }
  const userId = String(body?.user_id || '');
  if (!userId) return json({ error: 'Member ID is required.' }, 400);
  const serviceHeaders = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' };
  const callerResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: authorization } });
  if (!callerResponse.ok) return json({ error: 'Invalid or expired Supabase session.' }, 401);
  const caller = await callerResponse.json();
  const adminProfileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(caller.id)}&select=id,role&limit=1`, { headers: serviceHeaders });
  const adminProfiles = adminProfileResponse.ok ? await adminProfileResponse.json() : [];
  if (adminProfiles[0]?.role !== 'admin') return json({ error: 'Unauthorized: Admin role required.' }, 403);
  const getUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, { headers: serviceHeaders });
  const current = await getUserResponse.json().catch(() => ({}));
  if (!getUserResponse.ok || !current.user?.id) return json({ error: current.message || 'Could not find Auth user for this profile.' }, getUserResponse.status || 404);
  const updates = {};
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (!email) return json({ error: 'Email cannot be blank.' }, 400);
    updates.email = email;
    updates.email_confirm = true;
  }
  const metadata = { ...(current.user.user_metadata || {}) };
  for (const key of ['first_name', 'last_name', 'rank', 'instrument', 'role', 'phone']) if (body[key] !== undefined) metadata[key] = body[key];
  updates.user_metadata = metadata;
  const updateResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, { method: 'PUT', headers: serviceHeaders, body: JSON.stringify(updates) });
  const result = await updateResponse.json().catch(() => ({}));
  if (!updateResponse.ok) return json({ error: result.msg || result.message || result.error_description || 'Could not update Auth account.' }, updateResponse.status || 400);
  return json({ success: true, user: result.user || result });
}

async function resetMemberPassword(request, env) {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  if (!supabaseUrl || !env.SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      !supabaseUrl ? 'SUPABASE_URL' : null,
      !env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    ].filter(Boolean);

    return json(
      {
        error: 'Server Supabase credentials are not configured.',
        missing,
        hint: 'These must be configured as runtime Worker bindings, not Workers Build variables.',
      },
      500
    );
  }
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication required.' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request body.' }, 400); }
  const userId = String(body?.user_id || '');
  const newPassword = String(body?.new_password || '');
  if (!userId || newPassword.length < 8) {
    return json({ error: 'Member ID and a password of at least 8 characters are required.' }, 400);
  }
  const serviceHeaders = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };
  const callerResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: authorization },
  });
  if (!callerResponse.ok) return json({ error: 'Invalid or expired Supabase session.' }, 401);
  const caller = await callerResponse.json();
  const callerProfileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(caller.id)}&select=id,role&limit=1`,
    { headers: serviceHeaders }
  );
  if (!callerProfileResponse.ok) return json({ error: 'Could not verify administrator permissions.' }, 500);
  const callerProfiles = await callerProfileResponse.json();
  if (!callerProfiles[0] || callerProfiles[0].role !== 'admin') return json({ error: 'Unauthorized: Admin role required.' }, 403);

  const response = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
    { method: 'PUT', headers: serviceHeaders, body: JSON.stringify({ password: newPassword }) }
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = result.msg || result.message || result.error_description || result.error || result.details;
    const error = typeof details === 'string' ? details : (details ? JSON.stringify(details) : 'Could not reset the member password.');
    return json({ error }, response.status || 400);
  }
  return json({ success: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/admin/create-member') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
      return createMember(request, env);
    }

    if (url.pathname === '/api/admin/update-member-auth') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
      return updateMemberAuth(request, env);
    }

    if (url.pathname === '/api/admin/reset-member-password') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
      return resetMemberPassword(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
