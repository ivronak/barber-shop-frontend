import React, { useState, useEffect } from 'react';
import { Plus, Trash, Pencil, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// API imports
import { useApi } from '@/hooks/useApi';
import { 
  getGSTRates, 
  updateGSTRates,
  deleteGSTRate,
  GSTRate as ApiGSTRate
} from '@/api/services/settingsService';

// Using UI types from the app
interface GSTComponent {
  id: string;
  name: string;
  // Allow string so input can be temporarily empty on mobile
  rate: number | string;
}

interface GSTRate {
  id: string;
  name: string;
  components: GSTComponent[];
  isActive: boolean;
  totalRate?: number;
}

// Helper to map between API and UI types
const mapApiToUiGSTRate = (apiRate: ApiGSTRate): GSTRate => {
  return {
    id: apiRate.id || '',
    name: apiRate.name,
    isActive: apiRate.is_active,
    totalRate: apiRate.total_rate,
    components: apiRate.components.map(comp => ({
      id: comp.id || `comp-${Date.now()}-${Math.random()}`,
      name: comp.name,
      rate: typeof comp.rate === 'string' ? parseFloat(comp.rate) || 0 : comp.rate
    }))
  };
};

// Helper to map UI model back to API model
const mapUiToApiGSTRate = (uiRate: GSTRate): ApiGSTRate => {
  // Check if it's a temporary ID (client-side generated)
  const isTemporaryId = uiRate.id.startsWith('temp-');
  
  return {
    // Only send ID if it's not a temporary one
    id: isTemporaryId ? undefined : uiRate.id,
    name: uiRate.name,
    is_active: uiRate.isActive,
    total_rate: uiRate.totalRate ?? uiRate.components.reduce((sum, comp) => {
      const numeric = typeof comp.rate === 'number' ? comp.rate : parseFloat(comp.rate);
      return sum + (isNaN(numeric) ? 0 : numeric);
    }, 0),
    components: uiRate.components.map(comp => {
      // Check if component has a temporary ID
      const isCompTempId = comp.id.startsWith('temp-');
      
      return {
        // Only send component ID if it's not temporary
        id: isCompTempId ? undefined : comp.id,
        name: comp.name,
        rate: typeof comp.rate === 'string' ? parseFloat(comp.rate) || 0 : comp.rate
      };
    })
  };
};

export const GSTSettings: React.FC = () => {
  const { toast } = useToast();
  
  // API hooks
  const {
    data: gstRatesData,
    loading: gstRatesLoading,
    error: gstRatesError,
    execute: fetchGSTRates
  } = useApi(getGSTRates);

  const {
    loading: updateLoading,
    error: updateError,
    execute: saveGSTRates
  } = useApi(updateGSTRates);
  
  const {
    loading: isDeleting,
    error: deleteError,
    execute: executeDeleteGSTRate
  } = useApi(deleteGSTRate);

  // UI state
  const [gstRates, setGstRates] = useState<GSTRate[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<GSTRate | null>(null);
  const [newRate, setNewRate] = useState<Partial<GSTRate>>({
    name: '',
    components: [{ id: `temp-${Date.now()}`, name: '', rate: '' }],
    isActive: false,
  });

  // Fetch GST rates on component mount
  useEffect(() => {
    fetchGSTRates();
  }, [fetchGSTRates]);

  // Update state when API data is loaded
  useEffect(() => {
    if (gstRatesData?.gstRates) {
      setGstRates(gstRatesData.gstRates.map(mapApiToUiGSTRate));
    }
  }, [gstRatesData]);

  // Handle API errors
  useEffect(() => {
    const error = gstRatesError || updateError || deleteError;
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [gstRatesError, updateError, deleteError, toast]);

  // Function to calculate total rate from components
  const calculateTotalRate = (components: GSTComponent[]): number => {
    const total = components.reduce((sum, comp) => {
      const numeric = typeof comp.rate === 'number' ? comp.rate : parseFloat(comp.rate);
      return sum + (isNaN(numeric) ? 0 : numeric);
    }, 0);
    return parseFloat(total.toFixed(2));
  };

  const handleAddRate = async () => {
    // Validate rate name
    if (!newRate.name || newRate.name.trim() === '') {
      toast({
        title: 'Missing information',
        description: 'Please provide a name for the GST rate.',
        variant: 'destructive',
      });
      return;
    }

    // Validate components: no empty names or rates and rates must be numeric
    const hasInvalidComponent = (newRate.components ?? []).some((comp) => {
      const numericRate = typeof comp.rate === 'number' ? comp.rate : parseFloat(comp.rate);
      return !comp.name?.trim() || comp.rate === '' || Number.isNaN(numericRate);
    });

    if (hasInvalidComponent) {
      toast({
        title: 'Invalid component',
        description: 'Each component must have a name and a numeric rate.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create new rate with proper structure
      const rateToAdd: GSTRate = {
        id: `temp-${Date.now()}`, // This ID will be replaced by the server
        name: newRate.name || '',
        components: newRate.components || [{ id: `temp-${Date.now()}`, name: 'GST', rate: 0 }],
        isActive: newRate.isActive || false,
        totalRate: calculateTotalRate(newRate.components || []),
      };

      // Add the new rate to the existing rates
      const updatedRates = [...gstRates, rateToAdd];
      
      // Convert all rates to API format
      const apiGstRates = updatedRates.map(mapUiToApiGSTRate);
      
      // Log what we're sending to the API for debugging
      console.log('Sending to API:', JSON.stringify({ gstRates: apiGstRates }));
      
      // Save to the backend - await the result before proceeding
      const result = await saveGSTRates(apiGstRates);
      
      if (result) {
        console.log('API response:', result);
        
        // Refresh the data from server to get the proper IDs
        await fetchGSTRates();
        
        // Reset form
        setNewRate({
          name: '',
          components: [{ id: `temp-${Date.now()}`, name: '', rate: '' }],
          isActive: false,
        });
        
        // Close the dialog
        setIsAddDialogOpen(false);
        
        // Show success message
        toast({
          title: 'Success',
          description: 'New GST rate has been added successfully.',
        });
      }
    } catch (error) {
      // Enhanced error logging
      console.error('Failed to add GST rate:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      toast({
        title: 'Error adding GST rate',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleEditRate = async () => {
    if (!selectedRate) return;

    // Validate rate name
    if (!selectedRate.name || selectedRate.name.trim() === '') {
      toast({
        title: 'Missing information',
        description: 'Please provide a name for the GST rate.',
        variant: 'destructive',
      });
      return;
    }

    // Validate components
    const hasInvalidComponent = selectedRate.components.some((comp) => {
      const numericRate = typeof comp.rate === 'number' ? comp.rate : parseFloat(comp.rate);
      return !comp.name?.trim() || comp.rate === '' || Number.isNaN(numericRate);
    });

    if (hasInvalidComponent) {
      toast({
        title: 'Invalid component',
        description: 'Each component must have a name and a numeric rate.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Update the selected rate in the local state
      const updatedRates = gstRates.map(rate => {
        if (rate.id === selectedRate.id) {
          return {
            ...selectedRate,
            totalRate: calculateTotalRate(selectedRate.components),
          };
        }
        return rate;
      });
      
      // Convert to API format
      const apiGstRates = updatedRates.map(mapUiToApiGSTRate);
      
      // Log what we're sending to the API for debugging
      console.log('Sending to API:', JSON.stringify({ gstRates: apiGstRates }));
      
      // Save to the backend - await the result
      const result = await saveGSTRates(apiGstRates);
      
      if (result) {
        console.log('API response:', result);
        
        // Refresh the data from server
        await fetchGSTRates();
        
        // Reset state and close dialog
        setSelectedRate(null);
        setIsEditDialogOpen(false);
        
        toast({
          title: 'Success',
          description: 'GST rate has been updated successfully.',
        });
      }
    } catch (error) {
      // Enhanced error logging
      console.error('Failed to update GST rate:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      toast({
        title: 'Error updating GST rate',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = (rate: GSTRate) => {
    setSelectedRate(rate);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedRate) {
      try {
        await executeDeleteGSTRate(selectedRate.id);
        setGstRates(gstRates.filter(r => r.id !== selectedRate.id));
        setDeleteDialogOpen(false);
        setSelectedRate(null);
        
        toast({
          title: 'Success',
          description: 'GST rate deleted successfully',
        });
      } catch {
        // Error will be handled by the useEffect
      }
    }
  };

  const handleUpdateComponent = (componentId: string, field: keyof GSTComponent, value: string | number) => {
    if (!selectedRate) return;

    const updatedComponents = selectedRate.components.map(comp => 
      comp.id === componentId ? { ...comp, [field]: value } : comp
    );
    
    setSelectedRate({
      ...selectedRate,
      components: updatedComponents,
    });
  };

  const handleAddComponent = () => {
    if (!selectedRate) return;

    const newComponent: GSTComponent = {
      id: `temp-${Date.now()}`,
      name: '',
      rate: '',
    };

    setSelectedRate({
      ...selectedRate,
      components: [...selectedRate.components, newComponent],
    });
  };

  const handleDeleteComponent = (componentId: string) => {
    if (!selectedRate) return;
    
    if (selectedRate.components.length <= 1) {
      toast({
        title: 'Cannot delete component',
        description: 'A GST rate must have at least one component.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedRate({
      ...selectedRate,
      components: selectedRate.components.filter(comp => comp.id !== componentId),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="GST Settings"
        description="Configure GST rates for your services"
        action={undefined}
      />

      {/* Main content */}
      <Card>
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <CardTitle>GST Rates</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-lg p-6">
                <DialogHeader>
                  <DialogTitle>Add New GST Rate</DialogTitle>
                  <DialogDescription>
                    Create a new GST rate with its components.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Rate Name</Label>
                    <Input
                      value={newRate.name}
                      onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                      placeholder="Enter rate name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Components</Label>
                    {newRate.components?.map((component, index) => (
                      <div key={component.id} className="flex gap-2">
                        <Input
                          value={component.name}
                          onChange={(e) => {
                            const updatedComponents = [...(newRate.components || [])];
                            updatedComponents[index] = {
                              ...component,
                              name: e.target.value,
                            };
                            setNewRate({ ...newRate, components: updatedComponents });
                          }}
                          placeholder="Component name"
                        />
                        <Input
                          type="number"
                          value={component.rate}
                          onChange={(e) => {
                            const updatedComponents = [...(newRate.components || [])];
                            updatedComponents[index] = {
                              ...component,
                              rate: e.target.value,
                            };
                            setNewRate({ ...newRate, components: updatedComponents });
                          }}
                          placeholder="Rate %"
                          className="w-24"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (newRate.components && newRate.components.length > 1) {
                              const updatedComponents = newRate.components.filter((_, i) => i !== index);
                              setNewRate({ ...newRate, components: updatedComponents });
                            } else {
                              toast({
                                title: 'Cannot delete component',
                                description: 'A GST rate must have at least one component.',
                                variant: 'destructive',
                              });
                            }
                          }}
                          disabled={newRate.components && newRate.components.length <= 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newComponent: GSTComponent = {
                          id: `temp-${Date.now()}`,
                          name: '',
                          rate: '',
                        };
                        setNewRate({
                          ...newRate,
                          components: [...(newRate.components || []), newComponent],
                        });
                      }}
                    >
                      Add Component
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newRate.isActive}
                      onCheckedChange={(checked) => {
                        setNewRate({ ...newRate, isActive: checked });
                      }}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddRate} 
                    disabled={updateLoading}
                    className="w-full sm:w-auto"
                  >
                    {updateLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Add Rate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {/* Card loading state */}
          {gstRatesLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading GST rates...</span>
            </div>
          )}
          
          {/* Content when not initially loading */}
          {!gstRatesLoading && (
            gstRates.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No GST rates configured. Click "Add Rate" to create one.
              </div>
            ) : (
              <div className="relative">
                {/* Desktop/tablet view */}
                <div className="relative hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Components</TableHead>
                        <TableHead>Total Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gstRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium">{rate.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              {rate.components.map((component) => (
                                <div key={component.id} className="text-sm">
                                  {component.name}: {component.rate}%
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{rate.totalRate || calculateTotalRate(rate.components)}%</TableCell>
                          <TableCell>
                            <Badge variant={rate.isActive ? "default" : "secondary"}>
                              {rate.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedRate(rate);
                                  setIsEditDialogOpen(true);
                                }}
                                disabled={updateLoading || isDeleting}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteProduct(rate)}
                                disabled={updateLoading || isDeleting}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden py-2 space-y-3">
                  {gstRates.map((rate) => (
                    <div key={rate.id} className="border rounded-lg p-3 shadow-sm bg-card hover:border-primary/60 hover:shadow-md transition">
                      {/* Top row: name & total */}
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-sm">{rate.name}</h3>
                        <span className="font-semibold text-sm">{rate.totalRate || calculateTotalRate(rate.components)}%</span>
                      </div>

                      {/* Components list */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rate.components.map((component) => (
                          <Badge
                            key={component.id}
                            variant="secondary"
                            className="text-[10px] font-medium whitespace-nowrap"
                          >
                            {component.name}: {component.rate}%
                          </Badge>
                        ))}
                      </div>

                      {/* Bottom row: status + actions */}
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={rate.isActive ? 'default' : 'secondary'} className="text-[11px] px-2 py-0.5 rounded-full">
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRate(rate);
                              setIsEditDialogOpen(true);
                            }}
                            disabled={updateLoading || isDeleting}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(rate)}
                            disabled={updateLoading || isDeleting}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Edit GST Rate</DialogTitle>
            <DialogDescription>
              Modify the GST rate and its components.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rate Name</Label>
              <Input
                value={selectedRate?.name ?? ''}
                onChange={(e) => setSelectedRate(selectedRate ? {
                  ...selectedRate,
                  name: e.target.value,
                } : null)}
                placeholder="Enter rate name"
              />
            </div>
            <div className="space-y-2">
              <Label>Components</Label>
              {selectedRate?.components.map((component) => (
                <div key={component.id} className="flex gap-2">
                  <Input
                    value={component.name}
                    onChange={(e) => handleUpdateComponent(
                      component.id,
                      'name',
                      e.target.value
                    )}
                    placeholder="Component name"
                  />
                  <Input
                    type="number"
                    value={component.rate}
                    onChange={(e) => handleUpdateComponent(
                      component.id,
                      'rate',
                      e.target.value
                    )}
                    placeholder="Rate %"
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteComponent(component.id)}
                    disabled={selectedRate?.components.length <= 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddComponent}
              >
                Add Component
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={selectedRate?.isActive ?? false}
                onCheckedChange={(checked) => {
                  setSelectedRate(selectedRate ? {
                    ...selectedRate,
                    isActive: checked,
                  } : null);
                }}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditRate} 
              disabled={updateLoading}
              className="w-full sm:w-auto"
            >
              {updateLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              {selectedRate ? ` "${selectedRate.name}"` : ''} GST rate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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
};