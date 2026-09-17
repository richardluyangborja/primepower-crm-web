/**
 * True when the current pathname is the nav item's path or a page under it
 * (for example a detail page), so the parent entry stays highlighted while
 * drilling into records.
 */
export function isActivePath(
  pathname: string,
  path?: string | null
): boolean {
  if (!path) {
    return false
  }

  return pathname === path || pathname.startsWith(`${path}/`)
}
