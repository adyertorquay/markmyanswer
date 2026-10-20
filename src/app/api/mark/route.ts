import Anthropic from "@anthropic-ai/sdk";
import * as z from "zod/v4";
import { feedbackKey, getFeedbackCache } from "@/lib/feedbackCache";
import { markAnswer, MarkingRefusedError } from "@/lib/marker";
import { getLimiter } from "@/lib/ratelimit";
import { getQuestionType, LIMITS } from "@/lib/spec";
import { currentVisitor } from "@/lib/visitor";

export const maxDuration = 120;

const BodySchema = z.object({
  question: z.string().trim().min(5).max(LIMITS.question),
  context: z.string().max(LIMITS.context).optional(),
  type: z.string(),
  marks: z.number().int().min(1).max(12),
  answer: z.string().trim().min(1).max(LIMITS.answer),
  previousAnswer: z.string().max(LIMITS.answer).optional(),
  previousMark: z.number().int().min(0).max(12).optional(),
});

function error(status: number, message: string, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status });
}

export async function POST(request: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return error(400, "Please fill in the question and your answer (answers can be up to 6,000 characters).");
  }

  const type = getQuestionType(body.type);
  if (!type) return error(400, "Please choose a question type.");
  if (!type.marks.includes(body.marks)) {
    return error(400, `${type.label} questions are worth ${type.marks.join(" or ")} marks.`);
  }

  const visitor = await currentVisitor(request);

  // A resubmitted, unchanged answer gets the same feedback, without using a mark.
  const markRequest = { ...body, type };
  const cacheKey = feedbackKey(markRequest);
  const cached = await getFeedbackCache().get(cacheKey).catch(() => null);
  if (cached) return Response.json({ feedback: cached, remainingToday: null });

  const limit = await getLimiter().check(visitor);
  if (!limit.ok) {
    const messages = {
      burst: "You're going a bit fast. Take a minute to read your feedback, then try again.",
      daily: "You've used today's free marks. Come back tomorrow for more!",
      photos: "You've used today's free marks. Come back tomorrow for more!",
      network: "Everyone on your school or home network has used today's free marks. Please try again tomorrow.",
      global: "MarkMyAnswer is very busy today and has reached its daily limit. Please try again tomorrow.",
    };
    return error(429, messages[limit.reason], { retryAfterSeconds: limit.retryAfterSeconds });
  }

  try {
    const feedback = await markAnswer(markRequest);
    await getFeedbackCache()
      .set(cacheKey, feedback)
      .catch((err) => console.error("Caching feedback failed", err));
    return Response.json({ feedback, remainingToday: limit.remainingToday });
  } catch (err) {
    if (err instanceof MarkingRefusedError) {
      return error(422, "Sorry, we couldn't mark that answer. Please check it's an answer to the question and try again.");
    }
    if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError) {
      return error(503, "The marker is busy right now. Please try again in a moment.");
    }
    console.error("Marking failed", err);
    return error(500, "Something went wrong while marking. Please try again.");
  }
}
