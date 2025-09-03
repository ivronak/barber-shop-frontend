import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Download,
  Filter,
  Plus,
  Search,
  SortAsc,
  X,
  Loader2,
  CalendarIcon,
  Edit
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
  SheetClose,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils';
import { InvoiceDialog } from '@/features/pos/InvoiceDialog';
import { StepInvoiceDialog } from '@/features/pos/StepInvoiceDialog';
import { EditInvoiceDialog } from '@/features/pos/EditInvoiceDialog';
import { useApi } from '@/hooks/useApi';
import { getAllInvoices, Invoice } from '@/api/services/invoiceService';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { getAllStaff } from '@/api/services/staffService';
import { ReviewsPagination } from '@/components/ReviewsPagination';

// Define minimal type for staff option used in filter select
interface StaffOption {
  id: string;
  name?: string;
  user?: { name?: string };
}

export const POS: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('created');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { toast } = useToast();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [staffId, setStaffId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // pending filters for sheet UI
  const [pendingFilters, setPendingFilters] = useState({
    status: undefined as string | undefined,
    staffId: undefined as string | undefined,
    dateRange: undefined as DateRange | undefined,
  });

  // Staff options for filter select
  const {
    data: staffDataResponse,
    execute: fetchStaff
  } = useApi(getAllStaff);

  const staffOptions: StaffOption[] = staffDataResponse?.staff || [];

  // Map frontend sort values to API sort parameters
  const sortMap: Record<string, string> = {
    'created': 'created_desc',
    'date': 'date_desc',
    'amount': 'total_desc',
    'customer': 'customer_name_asc',
    'staff': 'staff_name_asc'
  };

  // Use the useApi hook to fetch invoices
  const {
    data: invoicesResponse,
    loading,
    error,
    execute: fetchInvoices
  } = useApi(getAllInvoices);

  // Function to load invoices with current filters/sort/search
  const loadInvoices = useCallback(() => {
    const dateFrom = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
    const dateTo = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;
    fetchInvoices(
      page,
      limit,
      sortMap[sortBy],
      dateFrom,
      dateTo,
      staffId,
      undefined,
      status,
      searchQuery
    );
  }, [fetchInvoices, page, limit, sortBy, dateRange, staffId, status, searchQuery]);

  // Initial and dependency-based load
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Fetch staff list when sheet opens (first time)
  useEffect(() => {
    if (showFilters && staffOptions.length === 0) {
      fetchStaff(1, 100, 'name_asc', undefined, 'available');
    }
  }, [showFilters, staffOptions.length, fetchStaff]);

  // Show error toast if API call fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: `Failed to load invoices: ${error.message}`,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const invoices = invoicesResponse?.invoices ?? [];
  const totalPages = invoicesResponse?.pages ?? 1;

  // Export invoices to CSV
  const handleExport = () => {
    if (!invoices || invoices.length === 0) {
      toast({
        title: 'No data',
        description: 'There are no invoices to export with the current filters.',
      });
      return;
    }

    const headers = [
      'Invoice',
      'Appointment',
      'Customer',
      'Staff',
      'Date',
      'Payment Method',
      'Status',
      'Subtotal',
      'Tax',
      'Discount',
      'Tip',
      'Total',
    ];

    const rows = invoices.map((inv) => [
      inv.id,
      inv.appointment_id || '',
      inv.customer_name,
      inv.staff_name,
      format(new Date(inv.date), 'yyyy-MM-dd'),
      inv.payment_method,
      inv.status,
      inv.subtotal,
      inv.tax_amount,
      inv.discount_amount ?? 0,
      inv.tip_amount ?? 0, // derived from service lines on backend
      inv.total,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            // Escape quotes by duplicating them per CSV standard
            const cellString = String(cell ?? '');
            if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
              return `"${cellString.replace(/"/g, '""')}"`;
            }
            return cellString;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export started',
      description: 'Your CSV file is being downloaded.',
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSortBy('created');
    setStatus(undefined);
    setStaffId(undefined);
    setDateRange(undefined);
    setPendingFilters({ status: undefined, staffId: undefined, dateRange: undefined });
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleApplyFilters = () => {
    setStatus(pendingFilters.status);
    setStaffId(pendingFilters.staffId);
    setDateRange(pendingFilters.dateRange);
    setShowFilters(false);
  };

  // Convert API status to UI badge
  const getStatusBadge = (status: Invoice['status']) => {
    const base = 'rounded-full px-2 py-0.5 text-[11px] font-semibold border';
    switch (status) {
      case 'paid':
        return <span className={`${base} border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400`}>Paid</span>;
      case 'pending':
        return <span className={`${base} border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400`}>Pending</span>;
      case 'cancelled':
        return <span className={`${base} border-red-500 text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400`}>Cancelled</span>;
      default:
        return null;
    }
  };

  // Convert API payment method to UI badge
  const getPaymentMethodBadge = (method: Invoice['payment_method']) => {
    // Capitalize first letter for display
    const label = method.charAt(0).toUpperCase() + method.slice(1);
    return <Badge variant="outline">{label}</Badge>;
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleInvoiceCreated = () => {
    // Refresh the invoice list after creating a new invoice
    fetchInvoices(page, limit, sortMap[sortBy], undefined, undefined, undefined, undefined, undefined, searchQuery);
    setShowNewInvoiceDialog(false);
  };

  const handleInvoiceUpdated = () => {
    fetchInvoices(page, limit, sortMap[sortBy], undefined, undefined, undefined, undefined, undefined, searchQuery);
    setShowEditDialog(false);
  };

  // Utility count of active filters (excluding search)
  const getActiveFilterCount = () => {
    let count = 0;
    if (status) count += 1;
    if (staffId) count += 1;
    if (dateRange?.from && dateRange?.to) count += 1;
    return count;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="POS & Invoices"
        description="Create and manage invoices"
        action={{
          label: "New Invoice",
          onClick: () => setShowNewInvoiceDialog(true),
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />
      
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-[200px] max-w-[400px] items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="search"
                    placeholder="Search invoices..."
                    className="pl-8"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Button type="submit" size="sm" className="h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              {/* Desktop Filter button */}
              <Button variant="outline" onClick={() => setShowFilters(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(searchQuery || sortBy !== 'created' || getActiveFilterCount() > 0) && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount() + (sortBy !== 'created' ? 1 : 0)}
                  </Badge>
                )}
              </Button>

              {(searchQuery || sortBy !== 'created' || getActiveFilterCount() > 0) && (
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

            {/* Mobile Filters button */}
            <Button
              variant="outline"
              className="sm:hidden flex-1"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(searchQuery || sortBy !== 'created' || getActiveFilterCount() > 0) && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount() + (sortBy !== 'created' ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Drawer */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader className="mb-6">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>

            <div className="space-y-6">
              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={pendingFilters.status ?? 'all'}
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Staff */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Staff</label>
                <Select
                  value={pendingFilters.staffId ?? 'all'}
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, staffId: value === 'all' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All staff" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="all">All staff</SelectItem>
                    {staffOptions.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>{staff.user?.name || staff.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {pendingFilters.dateRange?.from && pendingFilters.dateRange?.to ? (
                        `${format(pendingFilters.dateRange.from, 'MMM d, yyyy')} - ${format(pendingFilters.dateRange.to, 'MMM d, yyyy')}`
                      ) : (
                        'Select Date Range'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={pendingFilters.dateRange?.from}
                      selected={pendingFilters.dateRange}
                      onSelect={(range) => setPendingFilters(prev => ({ ...prev, dateRange: range }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={clearFilters}>Reset</Button>
                <SheetClose asChild>
                  <Button onClick={handleApplyFilters}>Apply</Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden sm:block overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                <TableRow 
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <TableCell className="font-medium">
                    {invoice.id}
                        {invoice.appointment_id && (
                      <div className="text-xs text-muted-foreground">
                            Appointment #{invoice.appointment_id}
                      </div>
                    )}
                  </TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>
                        {(() => {
                          if (invoice.staff && invoice.staff.length) {
                            return invoice.staff.map(s => s.name).join(', ');
                          }
                          const fromItems = [
                            ...(invoice.invoiceServices || invoice.services || []).map(i => i.staff_name).filter(Boolean),
                            ...(invoice.invoiceProducts || invoice.products || []).map(p => p.staff_name).filter(Boolean),
                          ] as string[];
                          if (fromItems.length) {
                            return Array.from(new Set(fromItems)).join(', ');
                          }
                          return invoice.staff_name || '-';
                        })()}
                      </TableCell>
                      <TableCell>{format(new Date(invoice.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{getPaymentMethodBadge(invoice.payment_method)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.total)}
                      </TableCell>
                  <TableCell onClick={(e)=>e.stopPropagation()}>
                    <Button size="icon" variant="ghost" onClick={()=>{ setEditInvoice(invoice); setShowEditDialog(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No invoices found matching your search" : "No invoices found"}
                  </TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
          )}
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceDialog
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          invoice={selectedInvoice}
          onInvoiceUpdated={() => fetchInvoices(page, limit, sortMap[sortBy], undefined, undefined, undefined, undefined, undefined, searchQuery)}
        />
      )}

      <StepInvoiceDialog
        open={showNewInvoiceDialog}
        onOpenChange={setShowNewInvoiceDialog}
        onInvoiceCreated={handleInvoiceCreated}
      />

      {editInvoice && (
        <EditInvoiceDialog
          invoice={editInvoice}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onInvoiceUpdated={handleInvoiceUpdated}
        />
      )}

      {/* Mobile card list */}
      <div className="sm:hidden py-2 space-y-3">
        {loading && (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {!loading && invoices.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {searchQuery ? "No invoices found matching your search" : "No invoices found"}
          </p>
        )}
        {!loading && invoices.length > 0 && invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="border rounded-lg p-3 shadow-sm bg-card cursor-pointer hover:bg-muted transition"
            onClick={() => handleInvoiceClick(invoice)}
          >
            {/* Top row: ID & Amount */}
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">#{invoice.id}</h3>
              <span className="font-semibold text-sm">{formatCurrency(invoice.total)}</span>
            </div>

            {/* Middle row: Customer & Date */}
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
              <span className="truncate max-w-[60%]">{invoice.customer_name}</span>
              <span>{format(new Date(invoice.date), 'dd MMM')}</span>
            </div>

            {/* Bottom row: Staff, Payment & Status */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs truncate text-muted-foreground max-w-[60%]">{invoice.staff_name}</span>
              <div className="flex items-center gap-1">
                {getPaymentMethodBadge(invoice.payment_method)}
                {getStatusBadge(invoice.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <ReviewsPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

    </div>
  );
};