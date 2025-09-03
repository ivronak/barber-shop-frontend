import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import {
  getAllReviews,
  approveReview,
  deleteReview,
  createReview,
  Review,
  CreateReviewRequest
} from '@/api/services/reviewService';

export interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  pages: number;
  page: number;
  limit: number;
  approved?: boolean;
  staffId?: string;
  sort: string;
  query?: string;
}

export const useReviews = () => {
  const { toast } = useToast();
  const [state, setState] = useState<ReviewsState>({
    reviews: [],
    loading: false,
    error: null,
    totalCount: 0,
    pages: 0,
    page: 1,
    limit: 10,
    sort: 'date_desc',
  });

  // Get all reviews API hook
  const {
    data: reviewsData,
    loading: loadingReviews,
    error: reviewsError,
    execute: fetchReviews
  } = useApi(getAllReviews);

  // Approve review API hook
  const {
    loading: approveLoading,
    error: approveError,
    execute: executeApprove
  } = useApi(approveReview);

  // Delete review API hook
  const {
    loading: deleteLoading,
    error: deleteError,
    execute: executeDelete
  } = useApi(deleteReview);

  // Create review API hook
  const {
    loading: createLoading,
    error: createError,
    execute: executeCreate
  } = useApi(createReview);

  // Load reviews with current filters
  const loadReviews = useCallback(() => {
    const { page, limit, approved, staffId, sort, query } = state;
    fetchReviews(page, limit, approved, staffId, sort, query);
  }, [fetchReviews, state.page, state.limit, state.approved, state.staffId, state.sort, state.query]);

  // Update reviews when data changes
  useEffect(() => {
    if (reviewsData) {
      setState(prev => ({
        ...prev,
        reviews: reviewsData.reviews,
        totalCount: reviewsData.totalCount,
        pages: reviewsData.pages,
        loading: false,
        error: null
      }));
    }
  }, [reviewsData]);

  // Handle loading states
  useEffect(() => {
    setState(prev => ({
      ...prev,
      loading: loadingReviews || approveLoading || deleteLoading || createLoading
    }));
  }, [loadingReviews, approveLoading, deleteLoading, createLoading]);

  // Handle errors
  useEffect(() => {
    const error = reviewsError || approveError || deleteError || createError;
    if (error) {
      setState(prev => ({ ...prev, error }));
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [reviewsError, approveError, deleteError, createError, toast]);

  // Change page
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  // Change filters – only update keys that are explicitly provided so that
  // other active filters remain intact. This allows, for example, submitting
  // an empty search (query = undefined) without resetting the approval / sort
  // filters currently in place.
  const setFilters = useCallback((filters: {
    approved?: boolean;
    staffId?: string;
    sort?: string;
    limit?: number;
    query?: string;
  }) => {
    setState(prev => {
      const nextState = { ...prev };

      if (Object.prototype.hasOwnProperty.call(filters, 'approved')) {
        nextState.approved = filters.approved;
      }
      if (Object.prototype.hasOwnProperty.call(filters, 'staffId')) {
        nextState.staffId = filters.staffId;
      }
      if (Object.prototype.hasOwnProperty.call(filters, 'sort')) {
        // If sort is undefined we keep previous sort, otherwise apply new one
        nextState.sort = filters.sort !== undefined ? filters.sort : prev.sort;
      }
      if (Object.prototype.hasOwnProperty.call(filters, 'limit')) {
        nextState.limit = filters.limit !== undefined ? filters.limit : prev.limit;
      }
      if (Object.prototype.hasOwnProperty.call(filters, 'query')) {
        nextState.query = filters.query;
      }

      // Whenever any filter changes, reset to first page
      nextState.page = 1;
      return nextState;
    });
  }, []);

  // Approve a review
  const handleApproveReview = useCallback(async (id: string) => {
    try {
      const result = await executeApprove(id);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Review approved successfully',
        });
        loadReviews();
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  }, [executeApprove, loadReviews, toast]);

  // Delete a review
  const handleDeleteReview = useCallback(async (id: string) => {
    try {
      const result = await executeDelete(id);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Review deleted successfully',
        });
        loadReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  }, [executeDelete, loadReviews, toast]);

  // Create a new review
  const handleCreateReview = useCallback(async (data: CreateReviewRequest) => {
    try {
      const result = await executeCreate(data);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Review created successfully',
        });
        loadReviews();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating review:', error);
      return false;
    }
  }, [executeCreate, loadReviews, toast]);

  // Initial load
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return {
    ...state,
    loadReviews,
    setPage,
    setFilters,
    approveReview: handleApproveReview,
    deleteReview: handleDeleteReview,
    createReview: handleCreateReview
  };
}; 