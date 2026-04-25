"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const limitationKinds = ["equipment_missing", "injury", "movement_dislike", "schedule", "custom"] as const;
const equipmentKeys = [
  "full_gym",
  "dumbbells",
  "barbell",
  "bench",
  "cables",
  "bands",
  "pullup_bar",
  "bodyweight_only",
] as const;

const profileFormSchema = z.object({
  fullName: z.string().min(1),
  age: z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }

      const text = String(value).trim();
      return text === "" ? undefined : text;
    },
    z.coerce.number().int().min(13).max(100).optional(),
  ),
  goal: z.enum(["bulking", "cutting", "fat_loss", "recomposition", "strength", "general_fitness"]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  trainingDaysPerWeek: z.coerce.number().int().min(1).max(7),
  sessionLengthMinutes: z.coerce.number().int().min(20).max(180),
  preferredLocation: z.enum(["gym", "home", "hybrid"]),
  availableEquipment: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .refine((items) => items.length > 0, "Add at least one equipment option.")
    .transform((items) =>
      items.map((item) => item.toLowerCase().replaceAll(" ", "_")).filter((item): item is (typeof equipmentKeys)[number] =>
        equipmentKeys.includes(item as (typeof equipmentKeys)[number]),
      ),
    ),
  limitations: z.string().optional(),
  specialRequests: z.string().optional(),
});

function parseLimitations(input: string | undefined) {
  return (input ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [kind = "custom", label = "", notes = ""] = line.split("|").map((part) => part.trim());
      return {
        kind: limitationKinds.includes(kind as (typeof limitationKinds)[number])
          ? (kind as (typeof limitationKinds)[number])
          : "custom",
        label,
        notes: notes || null,
      };
    })
    .filter((item) => item.label);
}

function parseSpecialRequests(input: string | undefined) {
  return (input ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", details = ""] = line.split("|").map((part) => part.trim());
      return {
        title,
        details,
      };
    })
    .filter((item) => item.title && item.details);
}

export async function saveOnboardingProfile(formData: FormData) {
  const parsed = profileFormSchema.safeParse({
    fullName: formData.get("fullName"),
    age: formData.get("age"),
    goal: formData.get("goal"),
    experienceLevel: formData.get("experienceLevel"),
    trainingDaysPerWeek: formData.get("trainingDaysPerWeek"),
    sessionLengthMinutes: formData.get("sessionLengthMinutes"),
    preferredLocation: formData.get("preferredLocation"),
    availableEquipment: formData.get("availableEquipment"),
    limitations: formData.get("limitations"),
    specialRequests: formData.get("specialRequests"),
  });

  if (!parsed.success) {
    throw new Error("Invalid onboarding data.");
  }

  if (parsed.data.availableEquipment.length === 0) {
    throw new Error("At least one valid equipment option is required.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        full_name: parsed.data.fullName,
        age: parsed.data.age ?? null,
        goal: parsed.data.goal,
        experience_level: parsed.data.experienceLevel,
        training_days_per_week: parsed.data.trainingDaysPerWeek,
        session_length_minutes: parsed.data.sessionLengthMinutes,
        preferred_location: parsed.data.preferredLocation,
        available_equipment: parsed.data.availableEquipment,
      },
      {
        onConflict: "user_id",
      },
    )
    .select("id")
    .single<{ id: string }>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const limitations = parseLimitations(parsed.data.limitations);
  const specialRequests = parseSpecialRequests(parsed.data.specialRequests);

  const { error: deleteLimitationsError } = await supabase
    .from("profile_limitations")
    .delete()
    .eq("profile_id", profile.id);

  if (deleteLimitationsError) {
    throw new Error(deleteLimitationsError.message);
  }

  const { error: deleteRequestsError } = await supabase
    .from("profile_special_requests")
    .delete()
    .eq("profile_id", profile.id);

  if (deleteRequestsError) {
    throw new Error(deleteRequestsError.message);
  }

  if (limitations.length > 0) {
    const { error } = await supabase.from("profile_limitations").insert(
      limitations.map((item) => ({
        profile_id: profile.id,
        ...item,
      })),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  if (specialRequests.length > 0) {
    const { error } = await supabase.from("profile_special_requests").insert(
      specialRequests.map((item) => ({
        profile_id: profile.id,
        ...item,
      })),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  redirect("/dashboard");
}
