/**
 * Generate URL-friendly slug from text
 * Example: "Avatar: The Way of Water" => "avatar-the-way-of-water"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

/**
 * Generate unique slug by appending number if slug already exists
 * Example: "avatar-2" if "avatar" exists
 */
export function generateUniqueSlug(baseSlug: string, existingSlug?: string): string {
  if (!existingSlug || existingSlug === baseSlug) {
    return baseSlug;
  }

  // Extract number from existing slug (e.g., "avatar-2" => 2)
  const match = existingSlug.match(/-(\d+)$/);
  const num = match ? parseInt(match[1], 10) + 1 : 2;

  return `${baseSlug}-${num}`;
}
