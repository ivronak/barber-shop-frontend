import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Phone, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBusinessInfo } from '@/hooks/useBusinessInfo';
import { submitContactForm } from '@/api/services/publicService';
import type { BusinessHour } from '@/api/services/publicService';

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

const cardVariant = {
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

export const Contact: React.FC = () => {
  const { toast } = useToast();
  const { businessInfo } = useBusinessInfo();


  const addressLines = "3820 Sherwood Dr #280, Sherwood Park, AB T8H 0Z9";
  const phoneNumber = businessInfo?.phone || '(555) 123-4567';
  const email = "Gentzhouse@gmail.com";

  // NEW: Build Google Maps "Get Directions" link dynamically based on the business address.
  const googleMapsUrl = React.useMemo(() => {
    const rawAddress = businessInfo?.address || '123 Main Street, New York, NY 10001';
    const destination = encodeURIComponent(rawAddress.replace(/\n/g, ' '));
    return `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${destination}`;
  }, [businessInfo?.address]);

  const hours = (businessInfo?.hours ?? (businessInfo as unknown as { business_hours?: BusinessHour[] })?.business_hours ?? []) as BusinessHour[];

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formEl = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formEl);

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string | undefined;
    const subject = formData.get('subject') as string | undefined;
    const message = formData.get('message') as string;

    try {
      setSubmitting(true);
      await submitContactForm({ name, email, phone, message, subject });
      toast({
        title: 'Message sent',
        description: "We'll get back to you as soon as possible.",
      });
      formEl.reset();
    } catch (error: unknown) {
      const errMsg = error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : undefined;
      toast({
        title: 'Submission failed',
        description: errMsg || 'Unable to submit your message. Please try again later.',
        variant: 'destructive',
    });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden min-h-[100svh] py-24 sm:py-32">
        {/* Background Image with Parallax Effect */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1080)',
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
              Get in Touch
              <span className="block text-primary-foreground/80">We're Here to Help</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8"
            >
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible
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
                  href="#contact-form"
                  className="text-white hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
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
                  href="/booking"
                  className="text-white hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Appointment
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

      {/* Contact Information Cards */}
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
              <Badge className="mb-4">Contact Us</Badge>
              <h2 className="text-3xl font-bold mb-4">Multiple Ways to Reach Us</h2>
              <p className="text-muted-foreground">
                Choose the most convenient way to get in touch with our team
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                variants={cardVariant}
                whileHover="hover"
                viewport={{ once: true }}
              >
                <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-8 flex flex-col h-full text-center">
                    <div className="flex flex-col items-center text-center space-y-3 flex-1">
                      <div className="p-3 bg-primary/5 rounded-full">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Visit Us</h3>
                        <p className="text-muted-foreground">
                          {addressLines}
                           
                        </p>
                      </div>
                      <Button variant="default" className="w-full mt-auto" asChild>
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white text-white">
                          Get Directions
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariant}
                whileHover="hover"
                viewport={{ once: true }}
              >
                <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-8 flex flex-col h-full text-center">
                    <div className="flex flex-col items-center text-center space-y-3 flex-1">
                      <div className="p-3 bg-primary/5 rounded-full">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Business Hours</h3>
                        <div className="space-y-1 text-muted-foreground max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
                          {hours.length > 0 ? (
                            hours.map((h: BusinessHour) => (
                              <p key={h.day_of_week}>
                                {capitalize(h.day_of_week)}:{' '}
                                {h.open_time && h.close_time ? `${formatTime(h.open_time)} - ${formatTime(h.close_time)}` : 'Closed'}
                              </p>
                            ))
                          ) : (
                            <>
                              <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                              <p>Saturday: 10:00 AM - 6:00 PM</p>
                              <p>Sunday: Closed</p>
                            </>
                          )}
                        </div>
                      </div>
                      <Button variant="default" className="w-full mt-auto" asChild>
                        <a href="/booking" className="hover:text-white text-white">
                          Book Now
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariant}
                whileHover="hover"
                viewport={{ once: true }}
              >
                <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-8 flex flex-col h-full text-center">
                    <div className="flex flex-col items-center text-center space-y-3 flex-1">
                      <div className="p-3 bg-primary/5 rounded-full">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Get in Touch</h3>
                        <div className="space-y-1 text-muted-foreground">
                          <p>Phone: {phoneNumber}</p>
                          <p>Email: {email}</p>
                          {/* <p>Live Chat Available</p> */}
                        </div>
                      </div>
                      <Button variant="default" className="w-full mt-auto" asChild>
                        <a href={`tel:${phoneNumber.replace(/[^\d+]/g, '')}`} className="hover:text-white text-white">
                          Call Now
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeIn}
              className="text-center mb-12"
            >
              <Badge className="mb-4">Send Message</Badge>
              <h2 className="text-3xl font-bold mb-4">Drop Us a Line</h2>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible
              </p>
            </motion.div>

            <motion.div
              variants={cardVariant}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="Enter your name" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="Enter your email" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" placeholder="Enter your phone number" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" placeholder="What's this about?" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Your message..."
                        className="min-h-[150px] resize-none"
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full hover:text-white" disabled={submitting}>
                      {submitting ? (
                        <Send className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                      <Send className="h-4 w-4 mr-2" />
                      )}
                      {submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeIn}
              className="text-center mb-12"
            >
              <Badge className="mb-4">FAQ</Badge>
              <h2 className="text-3xl font-bold mb-4">Common Questions</h2>
              <p className="text-muted-foreground">
                Find quick answers to frequently asked questions
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  question: "Do you accept walk-ins?",
                  answer: "Yes, we accept walk-ins based on availability. However, we recommend booking an appointment to ensure you get your preferred time slot."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, cash, and mobile payments including Apple Pay and Google Pay."
                },
                {
                  question: "Do you offer gift cards?",
                  answer: "Yes, we offer digital and physical gift cards in various denominations. They can be purchased in-store or through our website."
                },
                {
                  question: "What's your cancellation policy?",
                  answer: "We require at least 24 hours notice for cancellations. Late cancellations may be subject to a fee."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  variants={cardVariant}
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/5 rounded-full shrink-0">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
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
        <div className="container mx-auto px-4 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
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
            
            <motion.div variants={fadeIn}>
              <Button 
                size="lg" 
                className="min-w-[200px]"
                asChild
              >
                <motion.a
                  href="/booking"
                  className="text-white hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Your Visit
                  <ArrowRight className="h-4 w-4 ml-2" />
                </motion.a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};