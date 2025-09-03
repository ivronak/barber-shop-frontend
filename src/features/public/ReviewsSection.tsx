import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPublicReviews } from '@/api/services/publicService';
import { createPublicReview } from '@/api/services/reviewService';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Animation variants
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

export const ReviewsSection: React.FC = () => {
  const {
    data: apiData,
    execute: fetchReviews
  } = useApi(getPublicReviews);

  const { toast } = useToast();

  const [name, setName] = React.useState('');
  const [text, setText] = React.useState('');
  const [ratingInput, setRatingInput] = React.useState(5);
  const [submitting, setSubmitting] = React.useState(false);

  // Load reviews on mount
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const approvedReviews = apiData?.reviews?.map((r: any) => ({
    id: r.id,
    customerName: r.customer_name ?? r.customer?.name ?? 'Anonymous',
    reviewText: r.text ?? '',
    rating: r.rating ?? 5,
    profileImage: undefined,
  })) || [];

  const displayReviews = approvedReviews;
  
  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };
  
  const submitReview = async () => {
    if (!name || !text) {
      toast({ title: 'Please fill all fields.' });
      return;
    }
    setSubmitting(true);
    try {
      await createPublicReview({ customerName: name, rating: ratingInput, reviewText: text });
      toast({ title: 'Thank you!', description: 'Your review has been submitted for approval.' });
      setName('');
      setText('');
      setRatingInput(5);
      fetchReviews();
    } catch {
      toast({ title: 'Error', description: 'Could not submit review.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="space-y-12"
        >
          <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground">
              Don't just take our word for it - hear from our satisfied customers about their experiences
            </p>
          </motion.div>
          
          {displayReviews.length === 0 ? (
            <p className="text-center text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
          ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            {displayReviews.map((review) => (
              <motion.div
                key={review.id}
                variants={fadeIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {review.profileImage ? (
                            <AvatarImage src={review.profileImage} alt={review.customerName} />
                          ) : (
                            <AvatarFallback>
                              {review.customerName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.customerName}</p>
                          <div className="mt-1">{renderStars(review.rating)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="flex-grow text-muted-foreground">
                      "{review.reviewText}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>) }
          
        </motion.div>
      </div>
    </section>
  );
}; 