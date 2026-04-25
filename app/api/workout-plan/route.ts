import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildWorkoutPrompt } from "@/lib/ai/workout-prompt";
import { workoutRecommendationSchema, workoutRequestSchema } from "@/lib/ai/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedRequest = workoutRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: "Invalid workout request payload.",
        details: parsedRequest.error.flatten(),
      },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: "Missing OPENAI_API_KEY.",
      },
      { status: 500 },
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: buildWorkoutPrompt(parsedRequest.data),
      text: {
        format: {
          type: "json_schema",
          name: "workout_recommendation",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["title", "focus", "rationale", "summaryBullets", "exercises"],
            properties: {
              title: { type: "string" },
              focus: {
                type: "string",
                enum: [
                  "push",
                  "pull",
                  "legs",
                  "upper_body",
                  "lower_body",
                  "full_body",
                  "single_muscle",
                  "recovery",
                ],
              },
              rationale: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 5,
              },
              summaryBullets: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 5,
              },
              exercises: {
                type: "array",
                minItems: 3,
                maxItems: 8,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["name", "muscleGroup", "sets", "reps", "restSeconds", "warmup", "tips", "substitute"],
                  properties: {
                    name: { type: "string" },
                    muscleGroup: { type: "string" },
                    sets: { type: "number" },
                    reps: { type: "string" },
                    restSeconds: { type: "number" },
                    warmup: {
                      type: "array",
                      items: { type: "string" },
                    },
                    tips: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 1,
                      maxItems: 3,
                    },
                    substitute: {
                      type: ["string", "null"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const raw = response.output_text;
    const parsed = workoutRecommendationSchema.safeParse(JSON.parse(raw));

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "AI returned an invalid workout structure.",
          details: parsed.error.flatten(),
        },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate workout recommendation.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
