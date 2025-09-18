import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Purge Anonymous Users Edge Function
 * Deletes anonymous users older than 3 days
 * Uses service role to access auth.users table
 */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find anonymous users older than 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: oldUsers, error: queryError } = await supabase
      .from("auth.users")
      .select("id, created_at, email")
      .lte("created_at", threeDaysAgo)
      .eq("is_anonymous", true);

    if (queryError) {
      console.error("Error querying anonymous users:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to query users" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const usersToDelete = oldUsers || [];
    let deletedCount = 0;

    // Delete each anonymous user
    for (const user of usersToDelete) {
      try {
        await supabase.auth.admin.deleteUser(user.id);
        deletedCount++;
        console.log(`Deleted anonymous user: ${user.id}`);
      } catch (deleteError) {
        console.error(`Failed to delete user ${user.id}:`, deleteError);
      }
    }

    console.log(`Purged ${deletedCount} anonymous users`);

    return new Response(
      JSON.stringify({ 
        success: true,
        deletedCount,
        totalFound: usersToDelete.length,
        message: `Successfully purged ${deletedCount} anonymous users`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Purge anonymous users error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
