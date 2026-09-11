// Translates backend 409 "cannot be deleted because it has X" messages into
// actionable "what to do" steps shown in table delete confirmations.

const BLOCKER_ADVICE: Record<string, string> = {
  "converted client":
    "Delete the related client first, then you can delete this lead.",
  opportunities: "Delete or remove the related opportunities first.",
  surveys: "Remove the related satisfaction surveys first.",
  reminders: "Delete or resolve the related reminders first.",
  "status history": "The status history must be cleared before deleting.",
  communications: "Remove the related communications first.",
}

/** Returns a list of "how to fix" steps if the message describes a blocker. */
export function explainDeleteBlock(message: string): string[] {
  const lower = message.toLowerCase()
  const steps: string[] = []
  for (const [key, howToFix] of Object.entries(BLOCKER_ADVICE)) {
    if (lower.includes(key)) {
      steps.push(howToFix)
    }
  }
  return steps
}
