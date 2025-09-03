import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop – React component that automatically scrolls the window to the
 * top whenever the route pathname changes. Place it as a child of
 * <BrowserRouter> so it can access routing context.
 */
const ScrollToTop: React.FC<{ behavior?: ScrollBehavior }> = ({ behavior = 'smooth' }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Delay ensures scrolling occurs after the next paint when navigating.
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, behavior]);

  return null;
};

export default ScrollToTop; 