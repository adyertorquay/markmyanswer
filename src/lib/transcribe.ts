import Anthropic from "@anthropic-ai/sdk";
import { MODEL } from "./marker";

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type PhotoType = (typeof PHOTO_TYPES)[number];

const PROMPT = `This is a photo of a GCSE student's handwritten exam answer. Transcribe the handwriting exactly as written.

- Keep the student's own words, spelling, grammar and punctuation. Do not correct, improve, summarise or add anything, because the answer will be marked.
- Keep paragraph breaks. Ignore crossed-out words, page margins, printed question text and anything that isn't part of their answer.
- If a word is impossible to read, write [?] in its place.
- Output only the transcribed answer, with no introduction or comments.
- If there is no readable handwritten answer in the photo, output exactly: NO_ANSWER_FOUND`;

export class NoAnswerFoundError extends Error {}

let client: Anthropic | null = null;

export async function transcribeAnswer(data: string, mediaType: PhotoType): Promise<string> {
  client ??= new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });
  const text = response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("")
    .trim();
  if (!text || text.includes("NO_ANSWER_FOUND")) throw new NoAnswerFoundError();
  return text;
}
