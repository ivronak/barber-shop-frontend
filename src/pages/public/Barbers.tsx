import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePublicStaff } from '@/hooks/usePublicStaff';
import { Link } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Barbers: React.FC = () => {
  const { staff, loading: staffLoading, error: staffError } = usePublicStaff();

  const isFetching = staffLoading || staff.length === 0;

  if (isFetching) {
    return <Loader className="min-h-screen" size={48} />;
  }

  if (staffError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load barbers: {staffError.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden min-h-[100svh] py-24 sm:py-32">
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=1080)",
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Gradient Overlay */}
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
            className="space-y-8"
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-4 h-8 text-base px-4">Our Team</Badge>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Meet Our Expert Barbers
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
                Our skilled professionals are dedicated to giving you the best grooming experience.
              </p>
            </motion.div>

            {/* Hero CTA Buttons */}
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 h-12" asChild>
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
          </motion.div>
        </div>

        {/* Decorative Bottom Gradient */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      </section>

      {/* Team Grid Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {staff.map((staff) => (
              <motion.div
                key={staff.id}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="group relative flex flex-col h-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  {/* Image & Overlay */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <img
                      src={
                        staff.image || staff.user?.image ||
                        'https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1080'
                      }
                      alt={staff.name || 'Barber'}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Dark gradient for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    {/* Name & role */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {staff.name ?? staff.user?.name ?? 'Our Barber'}
                      </h3>
                      <span className="text-sm text-primary-foreground/80">
                        {staff.position ?? 'Barber'}
                      </span>
                    </div>
                  </div>

                  {/* Content section */}
                  <CardContent className="bg-background p-6 space-y-4 flex flex-col flex-1">
                    {staff.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {staff.bio}
                      </p>
                    )}

                    {Array.isArray(staff.services) && staff.services.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {staff.services.map((svc) => (
                          <Badge
                            key={svc.id}
                            variant="outline"
                            className="text-xs bg-muted/70 border-transparent text-foreground hover:bg-muted/60 transition-colors"
                          >
                            {svc.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      {staff.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{staff.phone}</span>
                        </div>
                      )}
                      {staff.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{staff.email}</span>
                        </div>
                      )}
                    </div>

                    <Button asChild className="w-full mt-auto group-hover:-translate-y-1 transition-transform">
                      <Link
                        to="/booking"
                        state={{
                          staffId: staff.id,
                          staffName: staff.name ?? staff.user?.name ?? 'Barber',
                          staffPosition: staff.position ?? 'Barber',
                        }}
                        className="hover:text-white"
                      >
                        Book Appointment
                        <Calendar className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div variants={fadeIn} className="space-y-6">
              <h2 className="text-3xl font-bold">Ready for a Fresh Look?</h2>
              <p className="text-muted-foreground">
                Book an appointment with one of our expert barbers and experience the best in men's grooming
              </p>
              <Button size="lg" asChild>
                <Link to="/booking" className="hover:text-white">
                  Book Your Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};