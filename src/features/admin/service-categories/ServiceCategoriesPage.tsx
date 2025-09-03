import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { CategoryDialog } from './CategoryDialog';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { ServiceCategory, getAllCategories, createCategory, updateCategory, deleteCategory } from '@/api/services/categoryService';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const ServiceCategoriesPage: React.FC = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  // API hooks
  const {
    data: categoriesData,
    loading: isLoading,
    error: fetchError,
    execute: fetchCategories,
  } = useApi(getAllCategories);

  const { execute: executeCreateCategory, loading: isCreating, error: createError } = useApi(createCategory);
  const { execute: executeUpdateCategory, loading: isUpdating, error: updateError } = useApi(updateCategory);
  const { execute: executeDeleteCategory, loading: isDeleting, error: deleteError } = useApi(deleteCategory);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle errors
  useEffect(() => {
    const error = fetchError || createError || updateError || deleteError;
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }, [fetchError, createError, updateError, deleteError, toast]);

  const handleAdd = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: { name: string; description?: string; imageUrl?: string }) => {
    try {
      if (selectedCategory) {
        await executeUpdateCategory(selectedCategory.id, values);
        toast({ title: 'Updated', description: 'Category updated successfully' });
      } else {
        await executeCreateCategory(values);
        toast({ title: 'Created', description: 'Category created successfully' });
      }
      setDialogOpen(false);
      fetchCategories();
    } catch {
      // Error handled in effect
    }
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      await executeDeleteCategory(selectedCategory.id);
      toast({ title: 'Deleted', description: 'Category deleted successfully' });
      setDeleteDialogOpen(false);
      fetchCategories();
    } catch {
      // error handled above
    }
  };

  const categories = categoriesData?.categories || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Service Categories" description="Manage service categories.">
        <Button onClick={handleAdd} disabled={isCreating || isUpdating}>
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center pt-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Mobile / small-screen card view */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:hidden">
            {categories.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">No categories found.</p>
            ) : (
              categories.map((cat) => (
                <Card key={cat.id} className="relative group overflow-hidden">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 flex items-center justify-center bg-muted">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="capitalize text-lg flex items-center justify-between">
                      {cat.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{cat.description || 'No description'}</p>
                  </CardContent>

                  {/* Hover actions for md+ (hidden on small) */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 md:flex">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(cat)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Action buttons for mobile stacked below */}
                  <div className="flex md:hidden justify-end gap-2 p-3">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(cat)} className="w-full">
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(cat)} className="w-full">
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block">
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground">No categories found.</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Image</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell>
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={cat.name} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="capitalize font-medium">{cat.name}</TableCell>
                        <TableCell className="truncate max-w-xs">{cat.description || '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(cat)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit dialog */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={selectedCategory}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
      />

      {/* Delete confirm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category. Existing services will still retain the category name but it will no longer be editable in the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceCategoriesPage; 