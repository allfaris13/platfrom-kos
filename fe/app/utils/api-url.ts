/**
 * Utility functions for handling API URLs and image paths
 */

// Get the API base URL from environment
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
};

// Cloudinary transform presets for different contexts
const CLOUDINARY_TRANSFORMS = {
  thumb: 'w_400,h_300,c_fill,q_auto,f_auto',      // Room thumbnails in lists
  detail: 'w_1200,h_800,c_limit,q_auto,f_auto',   // Full detail / hero images
  avatar: 'w_200,h_200,c_fill,g_face,q_auto,f_auto', // Profile photos
  proof: 'w_1000,c_limit,q_auto',                  // Payment proofs (keep readable)
  gallery: 'w_1200,h_800,c_fill,q_auto,f_auto',   // Gallery images
} as const;

export type ImagePreset = keyof typeof CLOUDINARY_TRANSFORMS;

/**
 * Convert relative image URLs to absolute URLs.
 * For Cloudinary URLs, optionally inject transformation parameters for performance.
 *
 * @param imageUrl - The image URL from the API (local relative or Cloudinary absolute)
 * @param preset   - Optional preset to apply Cloudinary transformations
 */
export const getImageUrl = (imageUrl: string | null | undefined, preset?: ImagePreset): string => {
  if (!imageUrl) return '';

  // If it's a Cloudinary URL, optionally inject transform
  if (imageUrl.includes('res.cloudinary.com')) {
    if (preset && CLOUDINARY_TRANSFORMS[preset]) {
      // Insert transform before the version segment (/upload/v...)
      return imageUrl.replace('/upload/', `/upload/${CLOUDINARY_TRANSFORMS[preset]}/`);
    }
    return imageUrl;
  }

  // If already absolute (non-Cloudinary), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Local relative URL → prepend API base URL
  const apiUrl = getApiUrl().replace(/\/api$/, '');
  return `${apiUrl}${imageUrl}`;
};

// Get default placeholder image
export const getPlaceholderImage = (): string => {
  return 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1080';
};
