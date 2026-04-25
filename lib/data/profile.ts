import { cache } from "react";
import type { UserLimitation, UserProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

interface ProfileRow {
  id: string;
  full_name: string;
  age: number | null;
  goal: UserProfile["goal"];
  experience_level: UserProfile["experienceLevel"];
  training_days_per_week: number;
  session_length_minutes: number;
  preferred_location: UserProfile["preferredLocation"];
  available_equipment: UserProfile["availableEquipment"];
}

interface LimitationRow {
  label: string;
  kind: UserLimitation["kind"];
  notes: string | null;
}

interface SpecialRequestRow {
  title: string;
  details: string;
}

function mapProfile(
  profile: ProfileRow,
  limitations: LimitationRow[],
  specialRequests: SpecialRequestRow[],
): UserProfile {
  return {
    fullName: profile.full_name,
    age: profile.age ?? undefined,
    goal: profile.goal,
    experienceLevel: profile.experience_level,
    trainingDaysPerWeek: profile.training_days_per_week,
    sessionLengthMinutes: profile.session_length_minutes,
    preferredLocation: profile.preferred_location,
    availableEquipment: profile.available_equipment,
    limitations: limitations.map((item) => ({
      label: item.label,
      kind: item.kind,
      notes: item.notes ?? undefined,
    })),
    specialRequests: specialRequests.map((item) => ({
      title: item.title,
      details: item.details,
    })),
  };
}

export const getCurrentUserProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (error || !profile) {
    return null;
  }

  const [{ data: limitations }, { data: specialRequests }] = await Promise.all([
    supabase
      .from("profile_limitations")
      .select("label, kind, notes")
      .eq("profile_id", profile.id)
      .returns<LimitationRow[]>(),
    supabase
      .from("profile_special_requests")
      .select("title, details")
      .eq("profile_id", profile.id)
      .returns<SpecialRequestRow[]>(),
  ]);

  return mapProfile(profile, limitations ?? [], specialRequests ?? []);
});
