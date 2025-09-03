import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ChevronRight, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePublicServices } from '@/hooks/usePublicServices';
import { formatCurrency } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from '@/components/ui/loader';
import { useNavigate } from 'react-router-dom';
import { Service } from '@/types';

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const cardVariants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const imageVariants = {
  initial: { 
    scale: 1.1,
    opacity: 0
  },
  animate: { 
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const serviceRow = {
  initial: { 
    opacity: 0,
    x: -20
  },
  animate: { 
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: { 
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    transition: {
      duration: 0.2
    }
  }
};

// Category images mapping
const categoryImages = {
  haircut: "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=1080",
  beard: "https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg?auto=compress&cs=tinysrgb&w=1080",
  shave: "https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg?auto=compress&cs=tinysrgb&w=1080",
  color: "https://images.pexels.com/photos/3997386/pexels-photo-3997386.jpeg?auto=compress&cs=tinysrgb&w=1080",
  treatment: "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=1080",
  combo: "https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg?auto=compress&cs=tinysrgb&w=1080"
};

export const Services: React.FC = () => {
  const { groupedServices, loading, error } = usePublicServices();
  const navigate = useNavigate();

  const handleServiceSelect = (service: Service) => {
    navigate('/booking', { state: { services: [service] } });
  };

  if (loading) {
    return (
      <Loader className="min-h-screen" size={48} />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load services: {error.message}</p>
      </div>
    );
  }

  if (!groupedServices) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden shadow-2xl min-h-[100svh] py-24 sm:py-32">
        <motion.div 
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=1080')] bg-cover bg-center bg-no-repeat"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Our Services
            </motion.h1>
            <motion.p 
              className="text-lg text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Premium grooming services tailored to your style
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 h-12"
                asChild
              >
                <motion.a
                  href="/booking"
                  className="text-white hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-[1400px]">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {Object.entries(groupedServices).map(([category, services], index) => (
              <motion.div
                key={category}
                variants={cardVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                  <div className="grid md:grid-cols-12 gap-0">
                    <motion.div 
                      className={`md:col-span-6 relative h-[200px] md:h-[500px] ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}
                      variants={imageVariants}
                    >
                      {(() => {
                        const coverImage = categoryImages[category as keyof typeof categoryImages] 
                          || (services[0] && services[0].imageUrl) 
                          || '/logo/logo-tran.png';
                        return (
                          <img 
                            src={coverImage}
                            alt={category}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        );
                      })()}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <h2 className="text-2xl font-bold text-white capitalize">
                          {category}
                        </h2>
                      </motion.div>
                    </motion.div>

                    <div className={`md:col-span-6 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                      <ScrollArea className="h-[400px] md:h-[500px]">
                        <div className="divide-y divide-border">
                          {services.map((service) => (
                            <motion.div
                              key={service.id}
                              variants={serviceRow}
                              initial="initial"
                              animate="animate"
                              whileHover="hover"
                              className="px-8 py-5 flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition-colors duration-200"
                              onClick={() => handleServiceSelect(service)}
                            >
                              <div className="flex-1 min-w-0 mr-6">
                                <div className="flex items-center gap-4">
                                  <motion.div
                                    whileHover={{ rotate: 15 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    <Scissors className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                  </motion.div>
                                  <div>
                                    <h3 className="font-medium group-hover:text-primary transition-colors">
                                      {service.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors line-clamp-2">
                                      {service.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <Badge variant="default" className="text-xs bg-primary text-primary-foreground group-hover:bg-primary transition-colors">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {service.duration} min
                                      </Badge>
                                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                        {formatCurrency(service.price)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServiceSelect(service);
                                }}
                              >
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-muted/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready for a Fresh Look?</h2>
            <p className="text-muted-foreground mb-8">
              Book an appointment with our expert barbers and experience premium grooming services designed for you
            </p>
            <Button size="lg" asChild>
              <motion.a
                href="/booking"
                className="text-white hover:text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Your Appointment
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};