import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Returns a Supabase client and the logged-in user's id and email,
// or sends the visitor to /login. Call it inside a <Suspense> boundary.
export async function requireUser() {
  // Render per request: the Supabase client reads the clock (Date.now()).
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/login");
  }
  return {
    supabase,
    userId: data.claims.sub,
    email: data.claims.email as string | undefined,
  };
}
