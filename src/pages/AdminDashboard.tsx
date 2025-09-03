import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MobileDashboard } from './MobileDashboard';
import { Dashboard as DesktopDashboard } from './Dashboard';

/**
 * AdminDashboard
 * Decides whether to render the mobile-friendly or desktop dashboard based on viewport width.
 */
export const AdminDashboard: React.FC = () => {
  // Tailwind's md breakpoint is 768px. We'll treat anything below that as mobile.
  const isMobile = useMediaQuery('(max-width: 767px)');

  return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
}; 