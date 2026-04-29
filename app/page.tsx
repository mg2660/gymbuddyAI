import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profile = await getCurrentUserProfile();
  redirect(profile ? "/dashboard" : "/onboarding");
}
