import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Service } from '@/api/services/serviceService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Scissors } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';

interface ServicesSwiperCarouselProps {
  services: Service[];
}

export const ServicesSwiperCarousel: React.FC<ServicesSwiperCarouselProps> = ({ services }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      spaceBetween={16}
      slidesPerView={1.2}
      breakpoints={{
        640: { slidesPerView: 2 },
        768: { slidesPerView: 2.5 },
        1024: { slidesPerView: 3 },
        1280: { slidesPerView: 4 },
      }}
      navigation
      pagination={{ clickable: true }}
      className="!pb-10"
    >
      {services.map((service) => (
        <SwiperSlide key={service.id} className="h-auto">
          <motion.div whileHover={{ y: -4 }} className="h-full">
            <Card className="h-full border hover:border-primary transition-colors shadow-sm">
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
        </SwiperSlide>
      ))}
    </Swiper>
  );
}; 