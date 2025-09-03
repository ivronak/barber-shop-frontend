import { format, subDays } from 'date-fns';

export interface Review {
  id: string;
  customerName: string;
  reviewText: string;
  rating: number; // 1-5 stars
  date: string;
  profileImage?: string;
  source: 'google' | 'facebook' | 'website'; // Source of the review
  status: 'approved' | 'pending' | 'rejected';
  featured: boolean; // Whether to highlight this review
}

// Generate dates for reviews
const generateDate = (daysAgo: number) => {
  return format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
};

export const reviewsData: Review[] = [
  {
    id: '1',
    customerName: 'James Wilson',
    reviewText: 'Absolutely loved my haircut! The barber took their time to understand exactly what I wanted. The shop has a great atmosphere and I\'ll definitely be back.',
    rating: 5,
    date: generateDate(2),
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    source: 'google',
    status: 'approved',
    featured: true
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    reviewText: 'First time here and was very impressed with the service. My stylist was professional and gave me exactly the look I was going for. Clean shop with a great vibe!',
    rating: 5,
    date: generateDate(5),
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    source: 'google',
    status: 'approved',
    featured: true
  },
  {
    id: '3',
    customerName: 'Michael Thompson',
    reviewText: 'Great experience overall. Staff is friendly and skilled. Would recommend to anyone looking for a professional cut.',
    rating: 4,
    date: generateDate(7),
    profileImage: 'https://randomuser.me/api/portraits/men/66.jpg',
    source: 'google',
    status: 'approved',
    featured: false
  },
  {
    id: '4',
    customerName: 'Emily Davis',
    reviewText: 'This place is my go-to for haircuts now. The prices are reasonable and the quality is exceptional. They really pay attention to detail.',
    rating: 5,
    date: generateDate(10),
    profileImage: 'https://randomuser.me/api/portraits/women/17.jpg',
    source: 'facebook',
    status: 'approved',
    featured: true
  },
  {
    id: '5',
    customerName: 'Robert Martinez',
    reviewText: 'Had to wait a bit longer than expected, but the haircut was worth it. Very skilled barbers and a nice atmosphere.',
    rating: 4,
    date: generateDate(12),
    profileImage: 'https://randomuser.me/api/portraits/men/39.jpg',
    source: 'website',
    status: 'approved',
    featured: false
  },
  {
    id: '6',
    customerName: 'Jessica Brown',
    reviewText: 'I was disappointed with my experience. The stylist seemed rushed and didn\'t listen to what I wanted. The cut was not what I asked for.',
    rating: 2,
    date: generateDate(15),
    profileImage: 'https://randomuser.me/api/portraits/women/63.jpg',
    source: 'google',
    status: 'rejected',
    featured: false
  },
  {
    id: '7',
    customerName: 'David Wilson',
    reviewText: 'Average experience. Nothing bad but nothing exceptional either. Haircut was fine but I probably won\'t go back.',
    rating: 3,
    date: generateDate(20),
    profileImage: 'https://randomuser.me/api/portraits/men/41.jpg',
    source: 'facebook',
    status: 'approved',
    featured: false
  },
  {
    id: '8',
    customerName: 'Jennifer Taylor',
    reviewText: 'I\'ve been coming here for years and have never been disappointed. The entire staff is professional and friendly. Highly recommend!',
    rating: 5,
    date: generateDate(25),
    profileImage: 'https://randomuser.me/api/portraits/women/26.jpg',
    source: 'google',
    status: 'approved',
    featured: true
  },
  {
    id: '9',
    customerName: 'Thomas Anderson',
    reviewText: 'My first visit was great! Clean shop, skilled barbers, and reasonable prices. Will definitely return.',
    rating: 5,
    date: generateDate(30),
    profileImage: 'https://randomuser.me/api/portraits/men/47.jpg',
    source: 'website',
    status: 'pending',
    featured: false
  },
  {
    id: '10',
    customerName: 'Amanda White',
    reviewText: 'Great vibe, excellent service. My stylist was knowledgeable and gave me some good tips on hair care.',
    rating: 4,
    date: generateDate(35),
    profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    source: 'google',
    status: 'approved',
    featured: false
  },
  {
    id: '11',
    customerName: 'Christopher Lee',
    reviewText: 'Fantastic experience from start to finish. The hot towel service was an unexpected bonus. Will definitely be coming back!',
    rating: 5,
    date: generateDate(40),
    profileImage: 'https://randomuser.me/api/portraits/men/89.jpg',
    source: 'google',
    status: 'approved',
    featured: true
  },
  {
    id: '12',
    customerName: 'Melissa Garcia',
    reviewText: 'Very pleased with my haircut. The stylist was attentive and made sure I was happy with the result before I left.',
    rating: 5,
    date: generateDate(45),
    profileImage: 'https://randomuser.me/api/portraits/women/75.jpg',
    source: 'facebook',
    status: 'pending',
    featured: false
  }
]; 