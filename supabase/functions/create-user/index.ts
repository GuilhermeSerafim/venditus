import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('No authorization header provided')
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Extract the JWT from the Authorization header
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim()

    if (!token) {
      console.error('No token extracted from Authorization header')
      throw new Error('Unauthorized - Invalid or expired token')
    }

    // Verify the user is authenticated using the token
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    console.log('Auth check - User:', user?.id, 'Error:', authError?.message)

    if (authError || !user) {
      console.error('Authentication failed:', authError?.message)
      throw new Error('Unauthorized - Invalid or expired token')
    }

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    console.log('User roles:', userRoles, 'Error:', rolesError?.message)

    if (rolesError || userRoles?.role !== 'admin') {
      console.error('User is not admin. Role:', userRoles?.role)
      throw new Error('Only admins can create users')
    }

    // Get request body
    const { email, password, name, role } = await req.json()

    if (!email || !password || !role) {
      throw new Error('Email, password, and role are required')
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create the new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email },
    })

    if (createError) {
      throw createError
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role,
      })

    if (roleError) {
      // If role assignment fails, delete the user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw roleError
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          name: newUser.user.user_metadata?.name,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
