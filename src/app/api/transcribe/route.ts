import Anthropic from "@anthropic-ai/sdk";
import * as z from "zod/v4";
import { getLimiter } from "@/lib/ratelimit";
import { LIMITS } from "@/lib/spec";
import { NoAnswerFoundError, PHOTO_TYPES, transcribeAnswer } from "@/lib/transcribe";
import { currentVisitor } from "@/lib/visitor";

export const maxDuration = 60;

// The browser shrinks photos before sending, so this is well under Vercel's
// 4.5 MB request limit.
const MAX_BASE64_LENGTH = 4_000_000;

const BodySchema = z.object({
  mediaType: z.enum(PHOTO_TYPES),
  data: z.string().min(100).max(MAX_BASE64_LENGTH),
});

function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return error(400, "That photo couldn't be read. Please try a JPEG or PNG photo.");
  }

  const visitor = await currentVisitor(request);
  const limit = await getLimiter().checkPhoto(visitor);
  if (!limit.ok) {
    const messages = {
      burst: "You're going a bit fast. Wait a minute, then try again.",
      daily: "You've used today's photo uploads. You can still type your answer.",
      photos: "You've used today's photo uploads. You can still type your answer.",
      network: "Everyone on your school or home network has used today's free marks. Please try again tomorrow.",
      global: "MarkMyAnswer is very busy today and has reached its daily limit. Please try again tomorrow.",
    };
    return error(429, messages[limit.reason]);
  }

  try {
    const text = await transcribeAnswer(body.data, body.mediaType);
    return Response.json({ text: text.slice(0, LIMITS.answer) });
  } catch (err) {
    if (err instanceof NoAnswerFoundError) {
      return error(422, "We couldn't find any handwriting in that photo. Try again with the page flat, in good light, and filling the screen.");
    }
    if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError) {
      return error(503, "The marker is busy right now. Please try again in a moment.");
    }
    console.error("Transcription failed", err);
    return error(500, "Something went wrong reading your photo. Please try again or type your answer.");
  }
}
