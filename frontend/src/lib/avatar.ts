/**
 * Generate initials from a name
 * @param name - Full name (e.g., "John Doe")
 * @returns Initials (e.g., "JD")
 */
export function getInitials(name: string): string {
  if (!name) return "?"

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generate a consistent color based on email hash
 * @param email - Email address
 * @returns HSL color string
 */
function getAvatarColor(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 65%, 55%)`
}

/**
 * Generate an SVG avatar from an email address
 * Uses a simple hash-based approach for consistent colors
 * @param email - Email address
 * @param name - Optional name for initials (defaults to email prefix)
 * @returns Data URL for the avatar SVG
 */
export function generateAvatarFromEmail(email: string, name?: string): string {
  const displayName = name || email.split("@")[0]
  const initials = getInitials(displayName)
  const bgColor = getAvatarColor(email)

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${bgColor}" rx="8"/>
      <text
        x="50"
        y="50"
        dominant-baseline="central"
        text-anchor="middle"
        fill="white"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="40"
        font-weight="600"
      >${initials}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
