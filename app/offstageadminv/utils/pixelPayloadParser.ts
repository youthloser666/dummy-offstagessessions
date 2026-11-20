export function parseCustomPixelPayload(rawJsonText: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(rawJsonText);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { raw: rawJsonText };
  } catch {
    return { raw: rawJsonText };
  }
}

