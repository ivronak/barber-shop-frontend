import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReviewsPagination } from '@/components/ReviewsPagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Check, Trash, Star, Plus, Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Review, CreateReviewRequest } from '@/api/services/reviewService';
import { CreateReviewForm } from '@/components/CreateReviewForm';

// Type for the UI-friendly review object
interface UIReview {
  id: string;
  customerName: string;
  customerEmail: string;
  staffName: string;
  staffPosition: string;
  rating: number;
  reviewText: string | null;
  date: string;
  isApproved: boolean;
}

// Helper function to transform API review to UI review
const transformReview = (review: Review): UIReview => {
  return {
    id: review.id,
    customerName: review.customer_name || review.customer?.name || 'Unknown Customer',
    customerEmail: review.customer?.email || 'No email provided',
    staffName: review.staff_name || review.staff?.user?.name || 'Unknown Staff',
    staffPosition: review.staff?.user?.role || 'Staff',
    rating: review.rating,
    reviewText: review.text,
    date: review.date,
    isApproved: review.is_approved
  };
};

// Component to display rating stars
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex space-x-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
        />
      ))}
    </div>
  );
};

const AdminReviews: React.FC = () => {
  const {
    reviews,
    loading,
    totalCount,
    pages,
    page,
    setPage,
    setFilters,
    approveReview,
    deleteReview,
    createReview
  } = useReviews();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<UIReview | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [isApprovingReview, setIsApprovingReview] = useState<string | null>(null);

  // Local UI state for filters so we can easily reset them
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [sortFilter, setSortFilter] = useState<string>('date_desc');

  // Transform API reviews to UI-friendly format
  const uiReviews = reviews.map(transformReview);

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setSelectedReviewId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedReviewId) {
      setIsDeletingReview(true);
      await deleteReview(selectedReviewId);
      setIsDeletingReview(false);
      setDeleteDialogOpen(false);
      setSelectedReviewId(null);
    }
  };

  // Handle view review
  const handleViewClick = (review: UIReview) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  // Handle approve review
  const handleApproveClick = async (id: string) => {
    setIsApprovingReview(id);
    await approveReview(id);
    setIsApprovingReview(null);
  };

  // Handle create review
  const handleCreateReview = async (data: CreateReviewRequest) => {
    const success = await createReview(data);
    if (success) {
      setCreateDialogOpen(false);
    }
    return success;
  };

  // Handle filter changes
  const handleApprovalFilterChange = (value: 'all' | 'approved' | 'pending') => {
    setApprovalFilter(value);
    if (value === 'all') {
      setFilters({ approved: undefined });
    } else if (value === 'approved') {
      setFilters({ approved: true });
    } else if (value === 'pending') {
      setFilters({ approved: false });
    }
  };

  const handleSortChange = (value: string) => {
    setSortFilter(value);
    setFilters({ sort: value });
  };

  // Clear all search & filter inputs
  const clearFilters = () => {
    setSearchInput('');
    setApprovalFilter('all');
    setSortFilter('date_desc');
    setFilters({ approved: undefined, sort: 'date_desc', query: '' });
  };

  // Handle search submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    setFilters({ query: query || undefined });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Customer Reviews</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-8 pr-2 h-9 rounded-md border bg-transparent text-sm focus:outline-none"
              />
            </div>
            <Button type="submit" size="sm" className="h-9 w-24 flex-shrink-0" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </form>
          
          <Select value={approvalFilter} onValueChange={handleApprovalFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="approved">Approved Only</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortFilter} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest First</SelectItem>
              <SelectItem value="date_asc">Oldest First</SelectItem>
              <SelectItem value="rating_desc">Highest Rating</SelectItem>
              <SelectItem value="rating_asc">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2 w-full sm:w-auto">
            <Plus size={16} />
            Add Review
          </Button>

          {(searchInput || approvalFilter !== 'all' || sortFilter !== 'date_desc') && (
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

      <Card>
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <CardTitle>Reviews ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {loading && !isDeletingReview && !isApprovingReview ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Desktop/tablet table */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uiReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    uiReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          {format(new Date(review.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div>{review.customerName}</div>
                          <div className="text-sm text-muted-foreground">{review.customerEmail}</div>
                        </TableCell>
                        <TableCell>
                          <div>{review.staffName}</div>
                          <div className="text-sm text-muted-foreground">{review.staffPosition}</div>
                        </TableCell>
                        <TableCell>
                          <RatingStars rating={review.rating} />
                        </TableCell>
                        <TableCell>
                          {review.isApproved ? (
                            <Badge className="bg-green-100 text-green-800">Approved</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewClick(review)}
                            >
                              View
                            </Button>
                            {!review.isApproved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveClick(review.id)}
                                disabled={isApprovingReview === review.id}
                              >
                                {isApprovingReview === review.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(review.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {uiReviews.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No reviews found</p>
                )}
                {uiReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-3 bg-card shadow-sm hover:border-primary/60 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleViewClick(review)}
                  >
                    {/* Top row: customer & rating */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm truncate max-w-[180px]">{review.customerName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{review.customerEmail}</p>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>

                    {/* Staff & date */}
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="truncate max-w-[60%]">{review.staffName}</span>
                      <span>{format(new Date(review.date), 'dd MMM yyyy')}</span>
                    </div>

                    {/* Status + actions */}
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant={review.isApproved ? 'default' : 'secondary'} className="text-[11px] px-2 py-0.5 rounded-full">
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                      <div className="flex flex-wrap justify-end gap-1">
                        {!review.isApproved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveClick(review.id);
                            }}
                            disabled={isApprovingReview === review.id}
                          >
                            {isApprovingReview === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(review.id);
                          }}
                          disabled={isDeletingReview}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {pages > 1 && (
                <div className="flex justify-center mt-4">
                  <ReviewsPagination
                    currentPage={page}
                    totalPages={pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-xs rounded-lg p-6 w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={isDeletingReview}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={isDeletingReview}
              className="w-full sm:w-auto flex items-center justify-center"
            >
              {isDeletingReview && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isDeletingReview ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Review Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg p-6 w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              {/* Customer & Date */}
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">Customer</h3>
                  <p>{selectedReview.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.customerEmail}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-medium">Date</h3>
                  <p>{format(new Date(selectedReview.date), 'MMMM dd, yyyy')}</p>
                </div>
              </div>
              <hr className="my-1 border-dashed" />
              
              <div>
                <h3 className="font-medium">Staff</h3>
                <p>{selectedReview.staffName} ({selectedReview.staffPosition})</p>
              </div>
              <hr className="my-1 border-dashed" />
              
              <div>
                <h3 className="font-medium">Rating</h3>
                <div className="flex items-center gap-2">
                  <RatingStars rating={selectedReview.rating} />
                  <span>{selectedReview.rating}/5</span>
                </div>
              </div>
              <hr className="my-1 border-dashed" />
              
              <div>
                <h3 className="font-medium">Review</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {selectedReview.reviewText || 'No review text provided.'}
                </p>
              </div>
              <hr className="my-1 border-dashed" />
              
              <div>
                <h3 className="font-medium">Status</h3>
                {selectedReview.isApproved ? (
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
            {selectedReview && !selectedReview.isApproved && (
              <Button 
                onClick={() => {
                  setIsApprovingReview(selectedReview.id);
                  approveReview(selectedReview.id).then(() => {
                    setIsApprovingReview(null);
                    setViewDialogOpen(false);
                  });
                }}
                disabled={isApprovingReview === selectedReview.id}
                className="w-full sm:w-auto flex items-center justify-center"
              >
                {isApprovingReview === selectedReview.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Review Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg p-6 w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Review</DialogTitle>
            <DialogDescription>
              Create a new customer review for a staff member.
            </DialogDescription>
          </DialogHeader>
          <CreateReviewForm 
            onSubmit={handleCreateReview}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews; 