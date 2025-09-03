import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { motion, useScroll, useTransform } from 'framer-motion';

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
};

export const PublicHeader: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const isMobile = window.matchMedia('(max-width: 639px)').matches;
  
  // Reduce header height on mobile
  const headerHeight = useTransform(scrollY, [0, 120], isMobile ? [96, 75] : [120, 72]);
  const logoHeight = useTransform(scrollY, [0, 120], isMobile ? [120, 110] : [140, 90]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Barbers', href: '/barbers' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <motion.header 
      className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50"
      style={{
        height: headerHeight,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-8 h-full">
        <div className="relative flex items-center justify-between h-full">
          {/* Invisible placeholder to balance center alignment */}
          <div className="md:hidden w-10" />

          {/* Centered logo */}
          <div className="absolute inset-0 flex justify-center md:static md:justify-start pointer-events-none">
            <Link to="/" className="flex items-center pointer-events-auto">
              <motion.img 
                src="/logo/logo-tran.png" 
                alt="Modern Cuts Logo" 
                style={{ height: logoHeight }}
                className="w-auto"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-12">
            {navigation.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link
                  to={item.href}
                  onClick={scrollToTop}
                  className={`text-base font-medium transition-colors relative ${
                    location.pathname === item.href 
                      ? 'text-primary' 
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.name}
                  {location.pathname === item.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="flex items-center space-x-4 md:space-x-6">
            <Link to="/booking" className="hidden md:block">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  Book Now
                </Button>
              </motion.div>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="border-b pb-4 mb-4">
                  <SheetTitle className="flex items-center justify-center">
                    <img src="/logo/logo-tran.png" alt="Modern Cuts Logo" className="h-28 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-lg font-medium py-2 transition-colors hover:text-primary ${
                        location.pathname === item.href ? 'text-primary' : 'text-foreground'
                      }`}
                      onClick={() => {
                        setIsOpen(false);
                        scrollToTop();
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                    <Link to="/booking" onClick={() => {
                      setIsOpen(false);
                      scrollToTop();
                    }}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
};