import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BadgeCheck,
  Sparkles,
  Crown,
  Shield,
  Heart,
  Gem
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { serviceData } from '@/mocks';
import { ReviewsSection } from '@/features/public/ReviewsSection';
import { useApi } from '@/hooks/useApi';
import { getAllServices, Service } from '@/api/services/serviceService';
import { ServicesShadCarousel } from '@/components/ServicesShadCarousel';
import { usePublicExperts } from '@/hooks/usePublicExperts';
import { Loader } from '@/components/ui/loader';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const serviceCard = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: { 
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

export const Home: React.FC = () => {
  const {
    data: fetchedServices,
    execute: fetchServices
  } = useApi(getAllServices);

  const { experts, loading: staffLoading, error: staffError } = usePublicExperts();

  // Fetch first 8 services on mount
  useEffect(() => {
    fetchServices(1, 8, 'name_asc');
  }, [fetchServices]);

  const featuredServices: Service[] = (fetchedServices?.services || serviceData).slice(0, 8);
  const featuredStaff = experts.slice(0, 3);

  if (staffLoading) {
    return <Loader className="min-h-screen" size={48} />;
  }

  if (staffError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load staff: {staffError.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative flex items-center justify-center overflow-hidden shadow-2xl min-h-[100svh] py-24 sm:py-32">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg)',
          }}
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
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-8 flex flex-col h-full"
          >
            <motion.h1 
              variants={fadeIn}
              className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Modern Cuts
              <span className="block text-primary-foreground/80">for the Modern Man</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8"
            >
              Experience premium grooming services at our state-of-the-art barbershop
            </motion.p>
            
            <motion.div
              variants={fadeIn}
              className="flex flex-wrap gap-4 justify-center"
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
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 h-12 bg-white/10 hover:bg-white/20 text-white border-white/20"
                asChild
              >
                <motion.a 
                  href="/services"
                  className="text-white hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Services
                </motion.a>
              </Button>
            </motion.div>

            <motion.div 
              variants={fadeIn}
              className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-5 md:gap-8 mt-auto items-center"
            >
              {[
                { type: 'stat', value: '10+', label: 'Expert Barbers' },
                { type: 'stat', value: '5000+', label: 'Happy Clients' },
                { type: 'logo' },
                { type: 'stat', value: '4.9', label: 'Rating' },
                { type: 'stat', value: '15+', label: 'Years Experience' },
              ].map((item, index) => (
                item.type === 'stat' ? (
                  <motion.div
                    key={index}
                    className="text-white/90 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-1">{item.value}</div>
                    <div className="text-sm sm:text-base md:text-lg text-white/80">{item.label}</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={index}
                    className="flex justify-center col-span-2 md:col-span-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src="/logo/logo-tran.png"
                        alt="Gentlemen's House Logo"
                        className="h-32 sm:h-36 md:h-40 w-auto drop-shadow-md"
                      />
                  </motion.div>
                )
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 w-full h-[12rem] sm:h-[16rem] bg-gradient-to-t from-black/90 via-black/70 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <Badge className="mb-4">Why Choose Us</Badge>
              <h2 className="text-3xl font-bold mb-4">The Modern Cuts Experience</h2>
              <p className="text-muted-foreground">
                Discover what makes us the premier choice for modern gentlemen
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Expert Barbers",
                  description: "Our team of skilled professionals brings years of experience to every cut",
                  image: "https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg"
                },
                {
                  icon: Gem,
                  title: "Premium Products",
                  description: "We use only the finest grooming products for the best results",
                  image: "https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg"
                },
                {
                  icon: Heart,
                  title: "Personalized Service",
                  description: "Tailored grooming experience to match your unique style",
                  image: "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg"
                },
                {
                  icon: BadgeCheck,
                  title: "Satisfaction Guaranteed",
                  description: "Your satisfaction is our top priority, always",
                  image: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={serviceCard}
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-2 border-transparent group rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={feature.image + '?auto=compress&cs=tinysrgb&w=1080'} 
                        alt={feature.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    </div>
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-300">
                          <feature.icon className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <Badge className="mb-4">Our Services</Badge>
              <h2 className="text-3xl font-bold mb-4">Premium Grooming Services</h2>
              <p className="text-muted-foreground">
                Experience the art of grooming with our expert barbers
              </p>
            </motion.div>

            <div className="-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-16 pb-8">
              <ServicesShadCarousel services={featuredServices} />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <Badge className="mb-4">Our Team</Badge>
              <h2 className="text-3xl font-bold mb-4">Meet Our Experts</h2>
              <p className="text-muted-foreground">
                Our skilled professionals are here to provide you with the best grooming experience
              </p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
              {featuredStaff.map((staff) => (
                <motion.div
                  key={staff.id}
                  variants={serviceCard}
                  whileHover="hover"
                  viewport={{ once: true }}
                  className="w-full"
                >
                  <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {(() => {
                        const customImage = staff.image || (staff as unknown as { user?: { image?: string } }).user?.image;
                        const fallback = 'https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1080';
                        return (
                          <img
                            src={customImage || fallback}
                            alt={staff.name}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        );
                      })()}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <CardContent className="p-6 relative">
                      <Badge variant={staff.is_active ? "default" : "outline"} className="mb-3">
                      {staff.position}
                      </Badge>
                      <h3 className="text-lg font-semibold mb-1">{staff.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{staff.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/60" />
        </motion.div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              variants={fadeIn}
              className="text-white space-y-6"
            >
              <Badge className="h-8 text-base px-4">The Experience</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                More Than Just a Haircut
              </h2>
              <p className="text-white/80 text-lg">
                Step into our modern sanctuary where style meets relaxation. 
                Experience premium grooming services in an atmosphere designed for the modern gentleman.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Crown, text: "Premium grooming products" },
                  { icon: BadgeCheck, text: "Skilled professional barbers" },
                  { icon: Sparkles, text: "Relaxing atmosphere" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg"
                className="mt-4"
                asChild
              >
                <motion.a
                  href="/booking"
                  className="text-white hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Your Experience
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-white/10"
            >
              <img
                src="https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1080"
                alt="Barber Shop Interior"
                loading="lazy"
                decoding="async"
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              />
            </motion.div>
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
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Ready to Experience the Difference?
            </motion.h2>
            
            <motion.p 
              variants={fadeIn}
              className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
            >
              Book your appointment now and discover why we're the preferred choice for modern gentlemen
            </motion.p>
            
            <Button size="lg" asChild>
              <motion.a
                href="/booking"
                className="text-white hover:text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Your Visit
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Reviews Section */}
      <ReviewsSection />
    </div>
  );
};

