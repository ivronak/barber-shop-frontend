// Design tokens for the Barber Shop Management System
// All styling should reference these tokens to maintain consistency

export const theme = {
  colors: {
    primary: '#000000', // Buttons, links, nav
    background: '#FFFFFF', // Page background
    card: '#FFFFFF', // Card/modals/surfaces
    textPrimary: '#111111', // Main text
    textMuted: '#555555', // Secondary text
    border: '#E5E5E5', // Borders, dividers
    accent: '#1E1E1E', // Hover/focus/interactive
    error: '#DC2626', // Error messages/actions
    warning: '#D97706', // Warning states
    success: '#059669', // Success states
    // Additional shades for gradients and states
    primaryLight: '#333333',
    accentLight: '#444444',
    backgroundAlt: '#F9F9F9',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px', 
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },
  
  fontWeights: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
  
  lineHeights: {
    body: 1.5,
    heading: 1.2,
  },
  
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
  
  transitions: {
    default: 'all 0.2s ease',
    fast: 'all 0.1s ease',
    slow: 'all 0.3s ease',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  zIndices: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  }
};