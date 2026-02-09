import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    console.log('🔍 Auth header received:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader) {
      console.error('Missing Authorization header')
      throw new Error('Missing Authorization header')
    }

    console.log('🔧 Environment check:', {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
            persistSession: false,
        }
      }
    )

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '')
    console.log('🎫 Token extracted, length:', token.length)
    
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    console.log('👤 User verification:', {
      hasUser: !!user,
      userId: user?.id,
      error: userError?.message,
    })

    if (userError || !user) {
      console.error('User auth failed:', userError)
      throw new Error(`Unauthorized: ${userError?.message || 'User not found'}`)
    }

    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (rolesError || roles?.role !== 'admin') {
      throw new Error('Forbidden - only admins can create users')
    }

    const { email, password, name, role, organization_id } = await req.json()

    // Initialize admin client to perform the action
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (createError) throw createError

    // Assign role
    if (role) {
        const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: newUser.user.id, role, organization_id })
        
        if (roleError) {
             // Rollback user creation if role assignment fails
             await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
             throw roleError;
        }
    }

    return new Response(JSON.stringify(newUser), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
    } catch (error) {
    console.error('Error in create-user:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
