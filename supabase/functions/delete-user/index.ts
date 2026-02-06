import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Create admin client to verify the user and check roles
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

    // Get the user from the JWT token using admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    console.log('Auth result:', { userId: user?.id, authError: authError?.message })

    if (authError || !user) {
      throw new Error(`Authentication failed: ${authError?.message || 'No user found'}`)
    }

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    console.log('Role check:', { role: userRoles?.role, error: rolesError?.message })

    if (rolesError || userRoles?.role !== 'admin') {
      throw new Error('Only admins can delete users')
    }

    const { userId } = await req.json()
    console.log('Delete request for userId:', userId)

    if (!userId) {
      throw new Error('User ID is required')
    }

    if (userId === user.id) {
      throw new Error('You cannot delete your own account')
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.log('Delete error:', deleteError.message)
      throw deleteError
    }

    console.log('User deleted successfully:', userId)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User deleted successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error:', errorMessage)
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
