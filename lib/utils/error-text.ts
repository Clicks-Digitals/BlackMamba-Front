/**
 * Show a form error in the reader's language.
 *
 * Our own zod schemas report message keys such as "validation.invalidEmail",
 * which go through next-intl. Anything else is a sentence the server already
 * wrote ("That password is not correct.") and is shown as it is; passing it
 * to t() printed "Profile.ProfileInfoTab.That password is not correct.".
 */
export function errorText(t: (key: never) => string, message: string): string;
export function errorText(t: (key: never) => string, message: string | undefined): string | undefined;
export function errorText(t: (key: never) => string, message: string | undefined): string | undefined {
  if (!message) return undefined;
  return message.startsWith("validation.") ? t(message as never) : message;
}
