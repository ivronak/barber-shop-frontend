import React from "react";
import { motion } from "framer-motion";
import { Clock, Star, Users, Award, ArrowRight, Smile } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { reviewsData } from '@/mocks';
import { usePublicExperts } from "@/hooks/usePublicExperts";
import { Loader } from "@/components/ui/loader";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const cardVariant = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const AboutPageStats = (teamCount: number) => [
  { icon: Users, value: `${teamCount}+`, label: "Expert Barbers" },
  { icon: Smile, value: "5000+", label: "Happy Clients" },
  { icon: Award, value: "15+", label: "Years Experience" },
  { icon: Star, value: "4.9", label: "Rating" },
];

export const About: React.FC = () => {
  const {
    experts,
    loading: staffLoading,
    error: staffError,
  } = usePublicExperts();

  const stats = AboutPageStats(experts.length || 10);

  const staff = experts.length ? experts : [];

  if (staffLoading) {
    return <Loader className="min-h-screen" size={48} />;
  }

  if (staffError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">
          Failed to load team: {staffError.message}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden min-h-[100svh] py-24 sm:py-32">
        {/* Background Image with Parallax Effect */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg)",
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
            className="space-y-8"
          >
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Our Story
              <span className="block text-primary-foreground/80">
                Since 2010
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8"
            >
              A tradition of excellence in men's grooming
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-wrap gap-4 justify-center"
            >
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

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeIn} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Gentlemen’s House Barbershop — Where Craft Meets Class.
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  At Gentlemen’s House Barbershop, we’re more than just a place
                  for a haircut — we’re a space where tradition meets precision,
                  and every client is treated like family. Founded by two
                  passionate and highly skilled barbers, Leo and Allen lifelong
                  friend, our mission is to bring top-tier grooming services to
                  Sherwood Park in a professional, welcoming, and modern
                  environment.
                </p>
                <p>
                  With over a decade of combined experience, we specialize in
                  classic and contemporary styles, precise fades, beard work,
                  and premium grooming tailored to each client. Our journey
                  began with a shared dream and years of dedication to the
                  craft, and now we’re proud to bring that dream to life with a
                  shop built on quality, trust, and community.
                </p>
                <p>
                  Every detail in our barbershop is designed to reflect
                  excellence — from the clean aesthetic and high-end equipment
                  to the personalized service you’ll receive from the moment you
                  walk in. Whether you’re here for a fresh fade, a beard
                  line-up, or just great conversation, we’re here to make sure
                  you leave looking and feeling your best.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src="https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=1080"
                  alt="Barbershop interior"
                  className="rounded-lg w-full h-64 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mt-8"
              >
                <img
                  src="https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1080"
                  alt="Barber tools"
                  className="rounded-lg w-full h-64 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
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
              className="text-center max-w-2xl mx-auto"
            >
              <Badge className="mb-4">Our Values</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Sets Us Apart
              </h2>
              <p className="text-muted-foreground">
                Our core values define who we are and guide everything we do
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Star,
                  title: "Excellence",
                  description:
                    "We strive for perfection in every cut, ensuring each client leaves looking and feeling their best.",
                },
                {
                  icon: Clock,
                  title: "Professionalism",
                  description:
                    "Our experienced team maintains the highest standards of service and cleanliness.",
                },
                {
                  icon: Award,
                  title: "Community",
                  description:
                    "We're proud to be part of our local community, creating a welcoming space for all.",
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  variants={cardVariant}
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6 p-6">
                      <value.icon className="h-12 w-12 mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
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
              className="text-center max-w-2xl mx-auto"
            >
              <Badge className="mb-4">Our Team</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Meet Our Expert Team
              </h2>
              <p className="text-muted-foreground">
                Our skilled professionals are here to provide you with the best
                grooming experience
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8">
              {staff.map((staff) => (
                <motion.div
                  key={staff.id}
                  variants={cardVariant}
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={
                          staff.image ||
                          (staff as unknown as { user?: { image?: string } })
                            .user?.image ||
                          "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1080"
                        }
                        alt={staff.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <CardContent className="p-6 relative">
                      <Badge
                        variant={staff.isAvailable ? "default" : "outline"}
                        className="mb-4"
                      >
                        {staff.position}
                      </Badge>
                      <h3 className="text-xl font-semibold mb-1">
                        {staff.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {staff.bio}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8 text-center"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="space-y-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <stat.icon className="h-8 w-8 mx-auto mb-4 opacity-80" />
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
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
            className="text-center max-w-2xl mx-auto space-y-8"
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
              Book your appointment now and discover why we're the preferred
              choice for modern gentlemen
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
    </div>
  );
};
