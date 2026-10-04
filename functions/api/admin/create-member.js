const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export async function onRequestPost(context) {
  const { request, env } = context;

  const supabaseUrl = supabaseUrl || env.VITE_SUPABASE_URL;

  if (!supabaseUrl || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json(
      { error: 'Server Supabase credentials are not configured.' },
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
  } = body || {};

  if (!first_name || !last_name || !cadet365_email) {
    return json({ error: 'First name, last name, and email are required.' }, 400);
  }

  const serviceHeaders = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };

  // Verify the caller's Supabase session.
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

  // Only an existing admin profile may create another portal account.
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

  // Generate a temporary password. The member should use the password-reset
  // email immediately after the account is created.
  const temporaryPassword = `${crypto.randomUUID()}A9!`;

  const authResponse = await fetch(
    `${supabaseUrl}/auth/v1/admin/users`,
    {
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
        },
      }),
    }
  );

  const authResult = await authResponse.json();

  if (!authResponse.ok || !authResult.id) {
    return json(
      { error: authResult.msg || authResult.message || 'Could not create Supabase Auth user.' },
      authResponse.status || 400
    );
  }

  const profile = {
    id: authResult.id,
    first_name: String(first_name).trim(),
    last_name: String(last_name).trim(),
    rank: rank || 'Cdt',
    cadet365_email: String(cadet365_email).trim().toLowerCase(),
    instrument: instrument || 'Clarinet 1',
    role: role || 'member',
    phone: phone ? String(phone).trim() : null,
    created_at: new Date().toISOString(),
  };

  const profileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles`,
    {
      method: 'POST',
      headers: {
        ...serviceHeaders,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(profile),
    }
  );

  const profileResult = await profileResponse.json();

  if (!profileResponse.ok) {
    // Roll back the Auth account if the profile row could not be created.
    await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(authResult.id)}`,
      {
        method: 'DELETE',
        headers: serviceHeaders,
      }
    );

    return json(
      { error: profileResult.message || profileResult.msg || 'Auth user was created, but the profile could not be saved.' },
      profileResponse.status || 400
    );
  }

  return json({ profile: profileResult[0] || profile }, 201);
}
