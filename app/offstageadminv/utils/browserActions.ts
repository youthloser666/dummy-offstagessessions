export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function confirmDestructiveAction(message: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.confirm(message);
}

