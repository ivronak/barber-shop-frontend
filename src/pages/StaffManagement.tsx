// Rename file to StaffManagement.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Filter, SortAsc, X, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { StaffList } from '@/features/staff/StaffList';
import { AddStaffDialog } from '@/features/staff/AddStaffDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Staff, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils';
import { useApi } from '@/hooks/useApi';
import { 
  getAllStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  Staff as ApiStaff,
  CreateStaffRequest 
} from '@/api/services/staffService';
import { Service, getAllServices } from '@/api/services/serviceService';

// Convert API staff to our internal Staff type
const mapApiStaffToInternal = (apiStaff: ApiStaff): Staff => {
  // Validate that role is a valid UserRole
  const userRole = apiStaff.user?.role || '';
  const validRole: UserRole = (userRole === 'admin' || userRole === 'staff' || userRole === 'billing') 
    ? userRole as UserRole 
    : 'staff';

  return {
    id: apiStaff.id,
    name: apiStaff.user?.name || '',
    email: apiStaff.user?.email || '',
    phone: apiStaff.user?.phone || '',
    role: validRole,
    bio: apiStaff.bio || '',
    services: apiStaff.services || [],
    commissionPercentage: parseFloat(apiStaff.commission_percentage?.toString() || '0'),
    isAvailable: apiStaff.is_available ?? true,
    image: apiStaff.user?.image || '/placeholder.jpg',
    totalEarnings: apiStaff.totalEarnings ? parseFloat(apiStaff.totalEarnings.toString()) : 0,
    totalAppointments: apiStaff.totalAppointments ? parseInt(apiStaff.totalAppointments.toString(), 10) : 0,
    breaks: apiStaff.breaks || [],
    workingHours: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
  };
};

// Convert internal Staff type to API format for updating/creating
const mapInternalStaffToApi = (staff: Staff & { password?: string }): CreateStaffRequest | Partial<ApiStaff> => {
  // For creating new staff (with password)
  if ('password' in staff && staff.password) {
    // These fields match the CreateStaffRequest interface
    return {
      password: staff.password,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      bio: staff.bio,
      services: staff.services,
      commission_percentage: staff.commissionPercentage,
      is_available: staff.isAvailable,
      image: staff.image !== '/placeholder.jpg' ? staff.image : undefined
    };
  }
  
  // For updating existing staff (no password)
  const updateData: (Partial<ApiStaff> & { 
    name?: string;
    email?: string;
    phone?: string;
    image?: string;
    password?: string;
  }) = {
    bio: staff.bio,
    services: staff.services,
    commission_percentage: staff.commissionPercentage,
    is_available: staff.isAvailable,
  };

  // Add user fields that will be extracted in the controller
  if (staff.name) updateData.name = staff.name;
  if (staff.email) updateData.email = staff.email;
  if (staff.phone) updateData.phone = staff.phone;
  if (staff.image && staff.image !== '/placeholder.jpg') updateData.image = staff.image;
  if (staff.password) updateData.password = staff.password;

  return updateData;
};

export const StaffManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const { toast } = useToast();
  
  // States for advanced filters (these don't trigger API calls until applied)
  const [pendingSortBy, setPendingSortBy] = useState<string>('name');
  const [pendingSortOrder, setPendingSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pendingFilterAvailability, setPendingFilterAvailability] = useState<string>('all');
  const [pendingSelectedServices, setPendingSelectedServices] = useState<string[]>([]);
  const [pendingCommissionRange, setPendingCommissionRange] = useState<[number, number]>([0, 50]);
  
  // Additional states for loading indicators
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [commissionRange, setCommissionRange] = useState<[number, number]>([0, 50]);
  const [earningsRange, setEarningsRange] = useState<[number, number]>([0, 10000]);
  const [appointmentsRange, setAppointmentsRange] = useState<[number, number]>([0, 100]);
  
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    availability: 'all' as 'all' | 'available' | 'unavailable',
    services: [] as string[],
    commissionRange: [0, 100] as [number, number]
  });

  // For services data
  const [allServices, setAllServices] = useState<Service[]>([]);
  
  // Initialize pending filters when opening the filter panel
  useEffect(() => {
    if (showFilters) {
      setPendingSortBy(sortBy);
      setPendingSortOrder(sortOrder);
      setPendingFilterAvailability(filterAvailability);
      setPendingSelectedServices([...selectedServices]);
      setPendingCommissionRange([...commissionRange]);
    }
  }, [showFilters, sortBy, sortOrder, filterAvailability, selectedServices, commissionRange]);
  
  // Add debounce for search query when using it in the URL params
  // This prevents API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update when user stops typing for 500ms
      // This doesn't trigger the API call directly - that happens in handleSearch
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // API Hooks
  const {
    data: staffData,
    loading: isLoading,
    error: staffError,
    execute: fetchStaff
  } = useApi(getAllStaff);
  
  const {
    error: createError,
    execute: executeCreateStaff
  } = useApi(createStaff);
  
  const {
    error: updateError,
    execute: executeUpdateStaff
  } = useApi(updateStaff);
  
  const {
    error: deleteError,
    execute: executeDeleteStaff
  } = useApi(deleteStaff);
  
  // Fetch services separately to get full category information
  const {
    data: servicesData,
    loading: isLoadingServiceList,
    error: servicesError,
    execute: fetchServices
  } = useApi(getAllServices);
  
  // Initial fetch for services (run once)
  useEffect(() => {
    fetchServices(1, 100, 'name_asc');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Update services list when API responds
  useEffect(() => {
    if (servicesData?.services) {
      setAllServices(servicesData.services);
    }
  }, [servicesData]);
  
  // Generate the sort parameter for the API call
  const getSortParam = useCallback(() => {
    let sortField = '';
    
    switch (sortBy) {
      case 'name':
        sortField = 'name';
        break;
      case 'appointments':
        // We'll handle the actual sorting client-side, but still inform the backend
        sortField = 'appointments';
        break;
      case 'earnings':
        // We'll handle the actual sorting client-side, but still inform the backend
        sortField = 'earnings';
        break;
      default:
        sortField = 'name';
    }
    
    return `${sortField}_${sortOrder}`;
  }, [sortBy, sortOrder]);
  
  // Apply filters when the Apply button is clicked
  const applyFilters = useCallback(() => {
    // Update the main states from pending states
    setSortBy(pendingSortBy);
    setSortOrder(pendingSortOrder);
    setFilterAvailability(pendingFilterAvailability);
    setSelectedServices([...pendingSelectedServices]);
    setCommissionRange([...pendingCommissionRange]);
    
    // Update applied filters
    setAppliedFilters({
      searchQuery: debouncedSearchQuery,
      availability: pendingFilterAvailability as 'all' | 'available' | 'unavailable',
      services: pendingSelectedServices,
      commissionRange: pendingCommissionRange as [number, number]
    });
    
    // Close the filter panel
    setShowFilters(false);
  }, [
    pendingSortBy, 
    pendingSortOrder, 
    pendingFilterAvailability, 
    pendingSelectedServices, 
    pendingCommissionRange, 
    debouncedSearchQuery
  ]);
  
  // Fetch staff data when relevant parameters change
  useEffect(() => {
    // Use a try-catch to handle potential errors
    const fetchData = async () => {
      try {
        await fetchStaff(
          currentPage, 
          itemsPerPage, 
          getSortParam(),
          appliedFilters.searchQuery,
          appliedFilters.availability,
          appliedFilters.services.length > 0 ? appliedFilters.services : undefined,
          appliedFilters.commissionRange[0] > 0 || appliedFilters.commissionRange[1] < 100 
            ? appliedFilters.commissionRange 
            : undefined
        );
      } catch (error) {
        console.error('Error fetching staff data:', error);
        // The error will be handled by the useApi hook's error state
      }
    };
    
    fetchData();
  }, [fetchStaff, currentPage, itemsPerPage, getSortParam, appliedFilters]);
  
  // (Optional) fall back to any services attached to staff response if not already set
  useEffect(() => {
    if (staffData?.services && allServices.length === 0) {
      setAllServices(staffData.services);
    }

    // Update pagination state if provided by the API
    if (staffData?.currentPage && staffData.currentPage !== currentPage) {
      setCurrentPage(staffData.currentPage);
    }
  }, [staffData, allServices, currentPage]);
  
  // Show error if services fail to load
  useEffect(() => {
    if (staffError) {
      toast({
        title: 'Error loading staff',
        description: staffError.message,
        variant: 'destructive',
      });
    }
    
    if (createError) {
      toast({
        title: 'Error creating staff',
        description: createError.message,
        variant: 'destructive',
      });
    }
    
    if (updateError) {
      toast({
        title: 'Error updating staff',
        description: updateError.message,
        variant: 'destructive',
      });
    }
    
    if (deleteError) {
      toast({
        title: 'Error deleting staff',
        description: deleteError.message,
        variant: 'destructive',
      });
    }
    
    if (servicesError) {
      toast({
        title: 'Error loading services',
        description: servicesError.message,
        variant: 'destructive',
      });
    }
  }, [staffError, createError, updateError, deleteError, servicesError, toast]);

  // Convert API staff to internal format
  const allStaff: Staff[] = staffData?.staff 
    ? staffData.staff.map(mapApiStaffToInternal) 
    : [];
  
  // Computed values
  const maxCommission = Math.max(...allStaff.map(s => s.commissionPercentage), 50);
  const maxEarnings = Math.max(...allStaff.map(s => s.totalEarnings), 10000);
  const maxAppointments = Math.max(...allStaff.map(s => s.totalAppointments), 100);
  
  // Total pages for pagination
  const totalPages = staffData?.pages || 1;
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (sortBy !== 'name') count++;
    if (filterAvailability !== 'all') count++;
    if (selectedServices.length > 0) count++;
    if (commissionRange[0] > 0 || commissionRange[1] < maxCommission) count++;
    if (earningsRange[0] > 0 || earningsRange[1] < maxEarnings) count++;
    if (appointmentsRange[0] > 0 || appointmentsRange[1] < maxAppointments) count++;
    return count;
  };

  // Return filtered staff
  const filteredStaff = useMemo(() => {
    // If we have no staff data, return empty array
    if (!allStaff || !Array.isArray(allStaff)) {
      return [];
    }

    // Server already applies most filters, but we still need to filter by earnings and appointments locally
    return allStaff.filter(staffMember => {
      // Earnings range filter (this is only applied client-side)
      if (staffMember.totalEarnings < earningsRange[0] || 
          staffMember.totalEarnings > earningsRange[1]) return false;
      
      // Appointments range filter (this is only applied client-side)
      if (staffMember.totalAppointments < appointmentsRange[0] || 
          staffMember.totalAppointments > appointmentsRange[1]) return false;
      
      return true;
    }).sort((a, b) => {
      // The basic sorting is done by the server, but we need to handle the special cases
      if (sortBy === 'appointments') {
        return sortOrder === 'asc'
          ? a.totalAppointments - b.totalAppointments
          : b.totalAppointments - a.totalAppointments;
      } else if (sortBy === 'earnings') {
        return sortOrder === 'asc'
          ? a.totalEarnings - b.totalEarnings
          : b.totalEarnings - a.totalEarnings;
      }
      
      // For name sorting, do a client-side sort even though server does it too
      // This ensures consistent behavior even if server sorting fails
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? (a.name || '').localeCompare(b.name || '')
          : (b.name || '').localeCompare(a.name || '');
      }
      
      return 0;
    });
  }, [allStaff, earningsRange, appointmentsRange, sortBy, sortOrder]);

  // Clear all filters (both applied and pending)
  const clearFilters = () => {
    // Clear main states
    setSearchQuery('');
    setSortBy('name');
    setSortOrder('asc');
    setFilterAvailability('all');
    setSelectedServices([]);
    setCommissionRange([0, maxCommission]);
    setEarningsRange([0, maxEarnings]);
    setAppointmentsRange([0, maxAppointments]);
    
    // Clear pending states
    setPendingSortBy('name');
    setPendingSortOrder('asc');
    setPendingFilterAvailability('all');
    setPendingSelectedServices([]);
    setPendingCommissionRange([0, maxCommission]);
    
    // Apply the cleared filters
    setAppliedFilters({
      searchQuery: '',
      availability: 'all',
      services: [],
      commissionRange: [0, 100]
    });
  };

  // Handle search button click
  const handleSearch = () => {
    setDebouncedSearchQuery(searchQuery);
    setAppliedFilters(prev => ({
      ...prev,
      searchQuery: searchQuery
    }));
  };

  // Handle Enter key in search field
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Handle service selection in filter panel
  const handlePendingServiceChange = (value: string) => {
    setPendingSelectedServices(prev => {
      return prev.includes(value) 
        ? prev.filter(s => s !== value) 
        : [...prev, value];
    });
  };

  const handleAddStaff = async (newStaff: Staff & { password: string }) => {
    try {
      const apiStaffData = mapInternalStaffToApi(newStaff) as CreateStaffRequest;
      await executeCreateStaff(apiStaffData);
      
      toast({
        title: 'Staff Added',
        description: `${newStaff.name} has been added to your team.`,
      });
      
      // Refresh staff list
      fetchStaff(currentPage, itemsPerPage, getSortParam());
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleUpdateStaff = async (updatedStaff: Staff) => {
    try {
      const apiStaffData = mapInternalStaffToApi(updatedStaff) as Partial<ApiStaff>;
      await executeUpdateStaff(updatedStaff.id, apiStaffData);
      
      toast({
        title: 'Staff Updated',
        description: `${updatedStaff.name}'s information has been updated.`,
      });
      
      // Refresh staff list
      fetchStaff(currentPage, itemsPerPage, getSortParam());
    } catch (error) {
      console.error('Error updating staff:', error);
      // Error will be handled by the dialog component
      throw error;
    }
  };
  
  const handleDeleteStaff = async (staffId: string) => {
    try {
      setDeletingStaffId(staffId);
      await executeDeleteStaff(staffId);
      
      toast({
        title: 'Staff Deleted',
        description: 'Staff member has been removed.',
      });
      
      // Refresh staff list
      fetchStaff(currentPage, itemsPerPage, getSortParam());
    } catch (error) {
      console.error('Error deleting staff:', error);
    } finally {
      setDeletingStaffId(null);
    }
  };

  // Toggle sort order when clicking on the same sort option
  const handleSortChange = (value: string) => {
    if (value === sortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage your team, track performance, and assign services"
        action={{
          label: "Add Staff",
          onClick: () => setShowAddDialog(true),
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />
      
      <div className="bg-card border rounded-lg">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-[400px] flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search staff..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                {isLoading && searchQuery !== debouncedSearchQuery && (
                  <div className="absolute right-2.5 top-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch gap-2">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</SelectItem>
                  <SelectItem value="appointments">Appointments {sortBy === 'appointments' && (sortOrder === 'asc' ? '↑' : '↓')}</SelectItem>
                  <SelectItem value="earnings">Earnings {sortBy === 'earnings' && (sortOrder === 'asc' ? '↑' : '↓')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAvailability} onValueChange={(value) => {
                setFilterAvailability(value);
                // Apply filters when availability changes
                setAppliedFilters(prev => ({
                  ...prev,
                  availability: value as 'all' | 'available' | 'unavailable'
                }));
              }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="available">Active Only</SelectItem>
                  <SelectItem value="unavailable">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => setShowFilters(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
                {isLoading && (
                  <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                )}
              </Button>

              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-lg text-muted-foreground">Loading staff...</span>
            </div>
          ) : staffError ? (
            <div className="text-center py-12">
              <div className="text-destructive mb-2">Error loading staff data</div>
              <p className="text-muted-foreground">{staffError.message || 'An unknown error occurred'}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  // Reset to defaults and try again
                  clearFilters();
                  fetchStaff(1, itemsPerPage, 'name_asc');
                }}
              >
                <span className="mr-2">↺</span>
                Reset Filters & Try Again
              </Button>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No staff members found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
          ) : (
            <>
              <StaffList 
                staff={filteredStaff} 
                onUpdateStaff={handleUpdateStaff}
                onDeleteStaff={handleDeleteStaff}
                deletingStaffId={deletingStaffId}
                services={allServices}
                isLoadingServices={isLoadingServiceList && allServices.length === 0}
              />
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {(() => {
                      // Show limited page buttons with ellipses for large page counts
                      const visiblePages = [];
                      
                      // Always show first page
                      if (totalPages > 0) {
                        visiblePages.push(1);
                      }
                      
                      // Calculate range of pages to show around current page
                      const rangeStart = Math.max(2, currentPage - 1);
                      const rangeEnd = Math.min(totalPages - 1, currentPage + 1);
                      
                      // Add ellipsis after first page if needed
                      if (rangeStart > 2) {
                        visiblePages.push(-1); // -1 represents ellipsis
                      }
                      
                      // Add pages around current page
                      for (let i = rangeStart; i <= rangeEnd; i++) {
                        visiblePages.push(i);
                      }
                      
                      // Add ellipsis before last page if needed
                      if (rangeEnd < totalPages - 1) {
                        visiblePages.push(-2); // -2 represents ellipsis
                      }
                      
                      // Always show last page if there is more than one page
                      if (totalPages > 1) {
                        visiblePages.push(totalPages);
                      }
                      
                      return visiblePages.map((page, index) => {
                        if (page < 0) {
                          // Render ellipsis
                          return (
                            <span key={`ellipsis-${index}`} className="px-2">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            disabled={isLoading}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle>Advanced Filters</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={pendingSortBy} onValueChange={setPendingSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name {pendingSortBy === 'name' && (pendingSortOrder === 'asc' ? '↑' : '↓')}</SelectItem>
                  <SelectItem value="appointments">Appointments {pendingSortBy === 'appointments' && (pendingSortOrder === 'asc' ? '↑' : '↓')}</SelectItem>
                  <SelectItem value="earnings">Earnings {pendingSortBy === 'earnings' && (pendingSortOrder === 'asc' ? '↑' : '↓')}</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  variant={pendingSortOrder === 'asc' ? "default" : "outline"} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setPendingSortOrder('asc')}
                >
                  Ascending
                </Button>
                <Button 
                  variant={pendingSortOrder === 'desc' ? "default" : "outline"} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setPendingSortOrder('desc')}
                >
                  Descending
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Availability</label>
              <Select value={pendingFilterAvailability} onValueChange={setPendingFilterAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="available">Active Only</SelectItem>
                  <SelectItem value="unavailable">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Services</label>
              <div className="grid grid-cols-2 gap-2">
                {isLoading ? (
                  <div className="col-span-2 py-4 flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : allServices.length > 0 ? (
                  allServices.map(service => (
                    <div key={service.id} className="flex items-center gap-2">
                      <Checkbox 
                        id={`service-${service.id}`} 
                        checked={pendingSelectedServices.includes(service.id)}
                        onCheckedChange={() => handlePendingServiceChange(service.id)}
                      />
                      <Label htmlFor={`service-${service.id}`} className="cursor-pointer">
                        {service.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-2 text-center text-muted-foreground">
                    No services available
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Commission Range</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0, maxCommission]}
                  min={0}
                  max={maxCommission}
                  step={1}
                  value={pendingCommissionRange}
                  onValueChange={(value) => {
                    setPendingCommissionRange(value as [number, number]);
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{pendingCommissionRange[0]}%</div>
                <div>{pendingCommissionRange[1]}%</div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Earnings Range</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0, maxEarnings]}
                  min={0}
                  max={maxEarnings}
                  step={100}
                  value={earningsRange}
                  onValueChange={(value) => setEarningsRange(value as [number, number])}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{formatCurrency(earningsRange[0])}</div>
                <div>{formatCurrency(earningsRange[1])}</div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Appointments Range</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0, maxAppointments]}
                  min={0}
                  max={maxAppointments}
                  step={5}
                  value={appointmentsRange}
                  onValueChange={(value) => setAppointmentsRange(value as [number, number])}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{appointmentsRange[0]}</div>
                <div>{appointmentsRange[1]}</div>
              </div>
            </div>
          </div>
          
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={clearFilters}>Reset Filters</Button>
            <Button onClick={applyFilters} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply Filters'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <AddStaffDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddStaff={handleAddStaff as (newStaff: Staff & { password: string }) => void}
        services={allServices}
        isLoadingServices={isLoadingServiceList && allServices.length === 0}
      />
    </div>
  );
};