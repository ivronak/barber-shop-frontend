import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Search, Plus, X, MoreHorizontal, Star as StarIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { reviewsData, Review } from '@/mocks/reviewsData';
import { cn } from '@/lib/utils';

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(reviewsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // Form state for adding/editing reviews
  const [formData, setFormData] = useState<Partial<Review>>({
    customerName: '',
    reviewText: '',
    rating: 5,
    source: 'google', // Keep for data structure, but hidden from UI
    status: 'approved', // Keep for data structure, but hidden from UI
    featured: false,    // Keep for data structure, but hidden from UI
    profileImage: '',
  });
  
  // Filter reviews based on search and filters
  const filteredReviews = reviews.filter(review => {
    // Search by name or text
    const searchMatch = searchQuery === '' || 
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.reviewText.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by rating
    const ratingMatch = filterRating === 'all' || review.rating.toString() === filterRating;
    
    return searchMatch && ratingMatch;
  });
  
  const handleAddReview = () => {
    setFormData({
      customerName: '',
      reviewText: '',
      rating: 5,
      source: 'website', // Default values that will be hidden
      status: 'approved', // Default values that will be hidden
      featured: false,    // Default value that will be hidden
      profileImage: '',
    });
    setShowAddDialog(true);
  };
  
  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setFormData({ ...review });
    setShowEditDialog(true);
  };
  
  const handleSaveReview = () => {
    if (showAddDialog) {
      // Add new review
      const newReview: Review = {
        id: Date.now().toString(),
        customerName: formData.customerName || '',
        reviewText: formData.reviewText || '',
        rating: formData.rating || 5,
        date: format(new Date(), 'yyyy-MM-dd'),
        source: 'website', // Fixed default value
        status: 'approved', // Fixed default value
        featured: false,    // Fixed default value
        profileImage: formData.profileImage,
      };
      
      setReviews([newReview, ...reviews]);
      setShowAddDialog(false);
    } else if (showEditDialog && selectedReview) {
      // Update existing review
      setReviews(reviews.map(review => 
        review.id === selectedReview.id 
          ? { 
              ...review, 
              customerName: formData.customerName || review.customerName,
              reviewText: formData.reviewText || review.reviewText,
              rating: formData.rating !== undefined ? formData.rating : review.rating,
              profileImage: formData.profileImage || review.profileImage,
              // Keep original source, status, and featured values
              source: review.source,
              status: review.status,
              featured: review.featured
            } 
          : review
      ));
      setShowEditDialog(false);
    }
  };
  
  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter(review => review.id !== id));
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setFilterRating('all');
  };
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
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
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Reviews"
        description="Manage and moderate customer reviews"
        action={{
          label: "Add Review",
          onClick: handleAddReview,
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>
            View and manage customer feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-[400px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reviews..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                
                {(searchQuery || filterRating !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No reviews found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
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
                            <div className="font-medium">{review.customerName}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="line-clamp-2 text-sm">
                            {review.reviewText}
                          </div>
                        </TableCell>
                        <TableCell>{renderStars(review.rating)}</TableCell>
                        <TableCell>{format(parseISO(review.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditReview(review)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Review Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Review</DialogTitle>
            <DialogDescription>
              Add a customer review that will appear on the website
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image URL (optional)</Label>
                <Input
                  id="profileImage"
                  value={formData.profileImage || ''}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reviewText">Review</Label>
              <Textarea
                id="reviewText"
                value={formData.reviewText}
                onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                placeholder="Enter customer review"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select 
                  value={formData.rating?.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveReview}>
              Add Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Review Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Make changes to the review
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customerName">Customer Name</Label>
                <Input
                  id="edit-customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-profileImage">Profile Image URL</Label>
                <Input
                  id="edit-profileImage"
                  value={formData.profileImage || ''}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-reviewText">Review</Label>
              <Textarea
                id="edit-reviewText"
                value={formData.reviewText}
                onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rating">Rating</Label>
                <Select 
                  value={formData.rating?.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveReview}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reviews; 