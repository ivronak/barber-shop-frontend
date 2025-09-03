import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Filter,
  Plus,
  Search,
  SortAsc,
  X,
  Loader2,
  Trash
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency, formatPhoneNumber } from '@/utils';
import { AddCustomerDialog } from '@/features/customers/AddCustomerDialog';
import { CustomerDetailsDialog } from '@/features/customers/CustomerDetailsDialog';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { useApi } from '@/hooks/useApi';
import { 
  getAllCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  Customer
} from '@/api/services/customerService';
import { useToast } from '@/hooks/use-toast';

export const Customers: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('last_visit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [page] = useState(1);
  const [limit] = useState(100); // Get more customers to allow client-side filtering
  
  // Advanced filters
  const [spendingRange, setSpendingRange] = useState<[number, number]>([0, 5000]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [customerSince, setCustomerSince] = useState<Date | undefined>(undefined);
  const [minVisits, setMinVisits] = useState<number>(0);
  
  // Pending filter state (for the filter sheet)
  const [pendingFilters, setPendingFilters] = useState({
    sortBy: 'last_visit',
    sortDirection: 'desc',
    spendingRange: [0, 5000] as [number, number],
    dateRange: undefined as DateRange | undefined,
    customerSince: undefined as Date | undefined,
    minVisits: 0
  });

  // API Hooks
  const {
    data: customersData,
    loading: isLoading,
    error: customersError,
    execute: fetchCustomers
  } = useApi(getAllCustomers);
  
  const {
    execute: saveCustomer
  } = useApi(createCustomer);
  
  const {
    execute: executeUpdateCustomer
  } = useApi(updateCustomer);
  
  const {
    execute: executeDeleteCustomer,
    loading: isDeleting
  } = useApi(deleteCustomer);

  // Function to fetch customers with current filters
  const loadCustomers = useCallback(() => {
    // Construct sort parameter
    const sortParam = `${sortBy}_${sortDirection}`;
    
    // Prepare API parameters
    const dateRangeParam = dateRange?.from && dateRange?.to
      ? { 
          from: format(dateRange.from, 'yyyy-MM-dd'), 
          to: format(dateRange.to, 'yyyy-MM-dd') 
        } 
      : undefined;
    
    const spendingRangeParam = {
      min: spendingRange[0],
      max: spendingRange[1]
    };
    
    const customerSinceParam = customerSince ? format(customerSince, 'yyyy-MM-dd') : undefined;

    console.log('Fetching customers with params:', {
      page,
      limit,
      sort: sortParam,
      search: searchQuery || undefined,
      dateRange: dateRangeParam,
      spendingRange: spendingRangeParam,
      customerSince: customerSinceParam,
      minVisits
    });
    
    fetchCustomers(page, limit, sortParam, searchQuery || undefined, dateRangeParam, spendingRangeParam, customerSinceParam, minVisits);
  }, [fetchCustomers, page, limit, sortBy, sortDirection, dateRange, spendingRange, searchQuery, customerSince, minVisits]);

  // Load customers on initial mount
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Error handling
  useEffect(() => {
    if (customersError) {
      toast({
        title: "Error loading customers",
        description: customersError.message,
        variant: "destructive"
      });
    }
  }, [customersError, toast]);

  // Set up customers data from API
  const customers = customersData?.customers || [];
  const maxSpending = Math.max(...customers.map(c => c.total_spent || 0), 5000);
  
  const clearFilters = () => {
    // Clear the search field
    setPendingSearchQuery('');
    setSearchQuery('');
    
    // Update pending filters
    setPendingFilters({
      sortBy: 'last_visit',
      sortDirection: 'desc',
      spendingRange: [0, maxSpending] as [number, number],
      dateRange: undefined,
      customerSince: undefined,
      minVisits: 0
    });
    
    // Also update the actual filters
    setSortBy('last_visit');
    setSortDirection('desc');
    setSpendingRange([0, maxSpending]);
    setDateRange(undefined);
    setCustomerSince(undefined);
    setMinVisits(0);
    
    // No manual reload here – useEffect will trigger automatically when filters state changes
  };

  const handleSearch = () => {
    setSearchQuery(pendingSearchQuery);
    // No manual reload – useEffect will react to updated filter states
  };

  const handleApplyFilters = () => {
    // Apply pending filters to actual state
    setSortBy(pendingFilters.sortBy);
    setSortDirection(pendingFilters.sortDirection as 'asc' | 'desc');
    setSpendingRange(pendingFilters.spendingRange);
    setDateRange(pendingFilters.dateRange);
    setCustomerSince(pendingFilters.customerSince);
    setMinVisits(pendingFilters.minVisits);
    
    setShowFilters(false);
    
    // No manual reload – useEffect will react to updated filter states
  };

  const formatShortDate = (date: string | undefined) => {
    if (!date) return 'Never';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      await saveCustomer(customerData);
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      loadCustomers();
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create customer",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      await executeUpdateCustomer(id, customerData);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      loadCustomers();
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update customer",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    try {
      await executeDeleteCustomer(customerToDelete.id);
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      loadCustomers();
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customer",
        variant: "destructive"
      });
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (sortBy !== 'last_visit') count++;
    if (spendingRange[0] > 0 || spendingRange[1] < maxSpending) count++;
    if (dateRange) count++;
    if (customerSince) count++;
    if (minVisits > 0) count++;
    return count;
  };

  // No additional client-side filtering; rely on API response
  const filteredCustomers = customers;

  // Initialize pending filters when opening the filter sheet
  const handleOpenFilters = (open: boolean) => {
    if (open) {
      // Copy current filters to pending
      setPendingFilters({
        sortBy,
        sortDirection,
        spendingRange,
        dateRange,
        customerSince,
        minVisits
      });
    }
    setShowFilters(open);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="Customers"
        description="Manage your customer database and view customer details."
      />
      
      {/* Search and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 max-w-md items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8"
              value={pendingSearchQuery}
              onChange={(e) => setPendingSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="ml-2 flex items-center" 
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch gap-2">
          {/* Filter & Sort group (single-line with horizontal scroll on small) */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto whitespace-nowrap">
            <Button
              variant="outline"
              size="sm"
              className={getActiveFilterCount() > 0 ? 'bg-muted' : ''}
              onClick={() => handleOpenFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {getActiveFilterCount() > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>

            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              loadCustomers();
            }}>
              <SelectTrigger className="w-[110px] sm:w-[160px]">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="last_visit">Last Visit</SelectItem>
                <SelectItem value="visit_count">Visit Count</SelectItem>
                <SelectItem value="total_spent">Total Spent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortDirection} onValueChange={(value) => {
              setSortDirection(value as 'asc' | 'desc');
              loadCustomers();
            }}>
              <SelectTrigger className="w-[72px] sm:w-[120px]">
                <SortAsc className="h-4 w-4 mr-2 rotate-90" />
                <SelectValue placeholder="Dir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>

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

          {/* Add button - full width on mobile, inline on larger */}
          <Button
            className="w-full sm:w-auto"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead className="text-right">Visits</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <div className="mt-2 text-sm text-muted-foreground">Loading customers...</div>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="text-muted-foreground">No customers found</div>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => {
                      clearFilters();
                      setShowFilters(false);
                    }}
                  >
                    Clear Filters
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => {
                return (
                  <TableRow 
                    key={customer.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10">
                            {customer.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{customer.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatPhoneNumber(customer.phone)}</TableCell>
                    <TableCell>{formatShortDate(customer.last_visit)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(customer.total_spent || 0)}
                    </TableCell>
                    <TableCell className="text-right">{customer.visit_count || 0}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerToDelete(customer);
                        }}
                      >
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Filter Sidebar */}
      <Sheet open={showFilters} onOpenChange={handleOpenFilters}>
        <SheetContent className="w-full sm:w-[540px] sm:max-w-[540px]  sm:p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filter Customers</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Sort By</h3>
              <Select 
                value={pendingFilters.sortBy} 
                onValueChange={(value) => 
                  setPendingFilters({...pendingFilters, sortBy: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="last_visit">Last Visit</SelectItem>
                  <SelectItem value="visit_count">Visit Count</SelectItem>
                  <SelectItem value="total_spent">Total Spent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Total Spent Range</h3>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(pendingFilters.spendingRange[0])} - {formatCurrency(pendingFilters.spendingRange[1])}
                </div>
              </div>
              <Slider
                value={pendingFilters.spendingRange}
                min={0}
                max={maxSpending}
                step={1}
                onValueChange={(value) => 
                  setPendingFilters({...pendingFilters, spendingRange: value as [number, number]})
                }
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Last Visit Date Range</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !pendingFilters.dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pendingFilters.dateRange?.from ? (
                      pendingFilters.dateRange.to ? (
                        <>
                          {format(pendingFilters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(pendingFilters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(pendingFilters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={pendingFilters.dateRange?.from}
                    selected={pendingFilters.dateRange}
                    onSelect={(range) => 
                      setPendingFilters({...pendingFilters, dateRange: range})
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {pendingFilters.dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto p-0"
                  onClick={() => 
                    setPendingFilters({...pendingFilters, dateRange: undefined})
                  }
                >
                  Clear dates
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Customer Since</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !pendingFilters.customerSince && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pendingFilters.customerSince ? (
                      format(pendingFilters.customerSince, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={pendingFilters.customerSince}
                    onSelect={(date) => 
                      setPendingFilters({...pendingFilters, customerSince: date})
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {pendingFilters.customerSince && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto p-0"
                  onClick={() => 
                    setPendingFilters({...pendingFilters, customerSince: undefined})
                  }
                >
                  Clear date
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Minimum Visit Count</h3>
                <div className="text-sm text-muted-foreground">{pendingFilters.minVisits}</div>
              </div>
              <Slider
                value={[pendingFilters.minVisits]}
                min={0}
                max={20}
                step={1}
                onValueChange={(value) => 
                  setPendingFilters({...pendingFilters, minVisits: value[0]})
                }
              />
            </div>

            {/* Sort direction (compact) */}
            <Select 
              value={pendingFilters.sortDirection}
              onValueChange={(value) => 
                setPendingFilters({...pendingFilters, sortDirection: value as 'asc' | 'desc'})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SheetFooter className="flex flex-row justify-between items-center sm:justify-between mt-2">
            <Button variant="ghost" onClick={() => {
              clearFilters();
              setShowFilters(false);
            }}>
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
            <Button onClick={handleApplyFilters} disabled={isLoading} className="flex items-center">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Customer Details Dialog */}
      <CustomerDetailsDialog
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
        onUpdate={handleUpdateCustomer}
      />

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleSaveCustomer}
      />
      
      {/* Delete Customer Dialog */}
      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {customerToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCustomer}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};