import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import {
  getAllExperts,
  createExpert,
  updateExpert,
  deleteExpert,
  Expert,
} from '@/api/services/expertService';
import { ExpertDialog } from './ExpertDialog';

export function ExpertsPage() {
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  const { toast } = useToast();

  // API
  const {
    data: expertsData,
    loading: isLoading,
    error: getError,
    execute: fetchExperts,
  } = useApi(getAllExperts);

  const {
    loading: isCreating,
    error: createError,
    execute: executeCreate,
  } = useApi(createExpert);

  const {
    loading: isUpdating,
    error: updateError,
    execute: executeUpdate,
  } = useApi(updateExpert);

  const {
    loading: isDeleting,
    error: deleteError,
    execute: executeDelete,
  } = useApi(deleteExpert);

  // Fetch experts on mount or refresh
  const loadExperts = () => {
    fetchExperts();
  };

  useEffect(() => {
    loadExperts();
  }, []);

  // Handle errors
  useEffect(() => {
    const error = getError || createError || updateError || deleteError;
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [getError, createError, updateError, deleteError, toast]);

  const handleAdd = () => {
    setSelectedExpert(null);
    setDialogOpen(true);
  };

  const handleEdit = (expert: Expert) => {
    setSelectedExpert(expert);
    setDialogOpen(true);
  };

  const handleDeleteClick = (expert: Expert) => {
    setSelectedExpert(expert);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Omit<Expert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedExpert) {
        // update
        await executeUpdate(selectedExpert.id, values);
        toast({ title: 'Success', description: 'Expert updated successfully' });
      } else {
        // create
        await executeCreate(values);
        toast({ title: 'Success', description: 'Expert added successfully' });
      }
      loadExperts();
      setDialogOpen(false);
    } catch {
      // handled in effect
    }
  };

  const handleDelete = async () => {
    if (!selectedExpert) return;
    try {
      await executeDelete(selectedExpert.id);
      toast({ title: 'Success', description: 'Expert deleted successfully' });
      loadExperts();
      setDeleteDialogOpen(false);
    } catch {
      // handled in effect
    }
  };

  // Filtered list based on searchQuery
  const experts = (expertsData?.experts || []).filter((exp) =>
    exp.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSearchClick = () => {
    setSearchQuery(pendingSearchQuery);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl font-bold">Experts Management</h1>
        <Button
          className="flex items-center gap-2 w-full md:w-auto"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4" />
          Add Expert
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Experts List</CardTitle>
          <CardDescription>Manage your shop's professionals</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search experts..."
                className="pl-10 h-full"
                value={pendingSearchQuery}
                onChange={(e) => setPendingSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchClick();
                }}
              />
            </div>
            <Button onClick={handleSearchClick} disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Expert</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No experts found.' : 'No experts available.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    experts.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 rounded-md">
                              {exp.image ? (
                                <AvatarImage src={exp.image} alt={exp.name} />
                              ) : (
                                <AvatarFallback className="rounded-md bg-muted">
                                  {exp.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="font-medium">{exp.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{exp.position || '-'}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              exp.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {exp.is_active ? 'active' : 'inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(exp)}
                              disabled={isUpdating}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(exp)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Mobile list */}
              <div className="space-y-3 md:hidden">
                {experts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No experts found.' : 'No experts available.'}
                  </p>
                ) : (
                  experts.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between bg-card rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-md">
                          {exp.image ? (
                            <AvatarImage src={exp.image} alt={exp.name} />
                          ) : (
                            <AvatarFallback className="rounded-md bg-muted">
                              {exp.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium leading-none">{exp.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exp.position || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(exp)}
                          disabled={isUpdating}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(exp)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ExpertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedExpert || undefined}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 