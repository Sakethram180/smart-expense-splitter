import { ZodError } from "zod";

export function jsonOk(data: unknown, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init);
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return Response.json(
    {
      ok: false,
      error: message,
      details
    },
    { status }
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Invalid request data.", 422, error.flatten());
  }

  if (error instanceof Error) {
    return jsonError(error.message, 500);
  }

  return jsonError("Something went wrong.", 500);
}
