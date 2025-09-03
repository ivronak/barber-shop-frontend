import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Scissors } from 'lucide-react';
import { Service } from '@/api/services/serviceService';
import { formatCurrency } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ServicesCarouselProps {
  services: Service[];
}

export const ServicesCarousel: React.FC<ServicesCarouselProps> = ({ services }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = container.offsetWidth * 0.8; // 80% of visible width
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const motionCard = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.03 }
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white shadow rounded-full hidden md:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white shadow rounded-full hidden md:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div
        ref={containerRef}
        className="overflow-x-auto thin-scrollbar scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="flex gap-4 px-1 md:px-8">
          {services.map((service) => (
            <motion.div
              key={service.id}
              className="flex-shrink-0"
              variants={motionCard}
              initial="initial"
              animate="animate"
              whileHover="hover"
              style={{ scrollSnapAlign: 'center' }}
            >
              <Card className="w-[260px] sm:w-[280px] md:w-[300px] h-full border hover:border-primary transition-colors shadow-sm">
                {/* Image placeholder */}
                <div className="aspect-[4/3] bg-muted/50 relative overflow-hidden">
                  <img
                    src={service.imageUrl || `https://source.unsplash.com/600x450/?barber,${service.category}`}
                    alt={service.name}
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="p-5 flex flex-col h-full">
                  <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground text-sm flex-1 mb-4 line-clamp-3">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} min
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(service.price)}
                    </span>
                  </div>

                  <Button variant="secondary" size="sm" asChild className="mt-auto w-full">
                    <motion.a
                      href="/booking"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-1"
                    >
                      Book
                      <Scissors className="h-4 w-4" />
                    </motion.a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}; 