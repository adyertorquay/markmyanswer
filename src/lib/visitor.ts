import { cookies } from "next/headers";
import { identifyVisitor, VISITOR_COOKIE, type Visitor } from "./ratelimit";

// Reads the anonymous visitor cookie, setting it on first visit.
export async function currentVisitor(request: Request): Promise<Visitor> {
  const cookieStore = await cookies();
  const { visitor, isNew } = identifyVisitor(request.headers, cookieStore.get(VISITOR_COOKIE)?.value);
  if (isNew) {
    cookieStore.set(VISITOR_COOKIE, visitor.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return visitor;
}
