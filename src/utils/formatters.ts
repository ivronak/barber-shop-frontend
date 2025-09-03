/**
 * Formats a currency value
 * @param value - The value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a phone number
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // If already formatted, return as is
  if (phone.includes('(') && phone.includes(')')) {
    return phone;
  }
  
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not a standard 10-digit number
  return phone;
};

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Generates a unique ID
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
export const generateId = (prefix = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${random}`;
};

/**
 * Calculates tax amount
 * @param amount - The amount to calculate tax on
 * @param taxRate - Tax rate percentage
 * @returns Tax amount
 */
export const calculateTax = (amount: number, taxRate: number): number => {
  return parseFloat((amount * (taxRate / 100)).toFixed(2));
};

/**
 * Calculates discount amount
 * @param amount - The amount to calculate discount on
 * @param type - Discount type ('percentage' or 'fixed')
 * @param value - Discount value
 * @returns Discount amount
 */
export const calculateDiscount = (
  amount: number,
  type: 'percentage' | 'fixed',
  value: number
): number => {
  if (type === 'percentage') {
    return parseFloat((amount * (value / 100)).toFixed(2));
  }
  return value;
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
};