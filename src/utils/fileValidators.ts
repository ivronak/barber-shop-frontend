export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Checks selected file against allowed image types and size.
 * @param file The file selected by the user
 * @returns { valid: true } when passes, otherwise { valid: false, message: 'reason' }
 */
export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: 'Only JPG, PNG, GIF or WEBP images are allowed.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      message: 'Please select an image smaller than 5 MB.',
    };
  }

  return { valid: true };
} 