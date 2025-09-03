import React, { useState, useEffect } from 'react';
import { 
  Clock,
  Save,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils';
import { WorkingHours } from '@/types';
import { getUser, getCurrentUser } from '@/api/auth';
import { updateStaffProfile, getStaffById } from '@/api/services/staffService';

// Define interfaces for API response types
interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

interface StaffService {
  id: string;
  name: string;
}

interface StaffData {
  id: string;
  user_id: string;
  position?: string;
  bio?: string;
  commission_percentage: string | number;
  is_available: boolean;
  user?: StaffUser;
  services?: StaffService[];
  workingHours?: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_break: boolean;
  }>;
  totalAppointments?: number;
  totalEarnings?: number;
}

export const StaffProfile: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get user from auth context
  const user = getUser();
  const staffId = user?.staff?.id;
  
  // State for staff data
  const [staff, setStaff] = useState<StaffData | null>(null);
  
  // Initialize form data
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    bio: '',
  });
  
  // Initialize working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: [], tuesday: [], wednesday: [], thursday: [],
    friday: [], saturday: [], sunday: []
  });

  // Fetch staff data
  useEffect(() => {
    async function fetchStaffData() {
      if (!staffId) {
        setError("Staff ID not found. Please log in again.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get latest user data to ensure we have the most up-to-date staff ID
        const updatedUser = await getCurrentUser();
        const staffResponse = await getStaffById(updatedUser.staff?.id || staffId);
        
        if (staffResponse.success) {
          setStaff(staffResponse.staff as StaffData);
          
          // Initialize form data
          setFormData({
            email: staffResponse.staff.user?.email || '',
            phone: staffResponse.staff.user?.phone || '',
            bio: staffResponse.staff.bio || '',
          });
          
          // Initialize working hours if available
          if (staffResponse.staff.workingHours && staffResponse.staff.workingHours.length > 0) {
            const hoursMap: WorkingHours = {
              monday: [], tuesday: [], wednesday: [], thursday: [],
              friday: [], saturday: [], sunday: []
            };
            
            staffResponse.staff.workingHours.forEach(hour => {
              const day = hour.day_of_week.toLowerCase() as keyof WorkingHours;
              hoursMap[day].push({
                start: hour.start_time,
                end: hour.end_time,
                isBreak: hour.is_break
              });
            });
            
            setWorkingHours(hoursMap);
          }
        } else {
          setError("Failed to load staff profile");
        }
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setError("Failed to load staff profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchStaffData();
  }, [staffId]);

  const handleSave = async () => {
    if (!staffId || !staff) return;
    
    try {
      setSaving(true);
      
      // Prepare data for update
      const updateData = {
        bio: formData.bio,
        email: formData.email,
        phone: formData.phone
      };
      
      const response = await updateStaffProfile(staffId, updateData);
      
      if (response.success) {
        // Update local state with response data
        setStaff(response.staff as StaffData);
        
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      } else {
        toast({
          title: 'Update failed',
          description: 'Failed to update profile. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'An error occurred while updating your profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  // Show error state
  if (error || !staff) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Profile</h2>
        <p className="text-muted-foreground mb-4">{error || "Failed to load staff profile"}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and update your profile information"
        action={{
          label: saving ? "Saving..." : "Save Changes",
          onClick: handleSave,
          icon: saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />,
          disabled: saving
        }}
      />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Profile Overview */}
        <Card className="md:col-span-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={staff.user?.image} alt={staff.user?.name} />
                <AvatarFallback>
                  {staff.user?.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-semibold">{staff.user?.name}</h2>
              <p className="text-sm text-muted-foreground mb-2">{staff.position || 'Staff Member'}</p>
              
              <div className="flex gap-2 mb-4">
                <Badge variant={staff.is_available ? "default" : "outline"}>
                  {staff.is_available ? 'Available' : 'Unavailable'}
                </Badge>
                <Badge variant="outline">{staff.commission_percentage}% Commission</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold">{staff.totalAppointments || 0}</p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {formatCurrency(staff.totalEarnings || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
              </div>
              
              <div className="text-sm text-left w-full space-y-2">
                <p className="font-medium">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {staff.services && staff.services.length > 0 ? (
                    staff.services.map((service: StaffService, i: number) => (
                      <Badge variant="secondary" key={i}>
                        {service.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No services assigned</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours Link Card */}
        <Card className="md:col-span-12">
          <CardHeader className="pb-4">
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>
              Manage your availability for appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm">Configure your working schedule and breaks for each day of the week.</p>
                <p className="text-sm text-muted-foreground">
                  Your current schedule has {Object.values(workingHours).flat().filter(slot => !slot.isBreak).length} time slots 
                  across {Object.values(workingHours).filter(day => day.length > 0).length} days.
                </p>
              </div>
              <Button asChild>
                <Link to="/staff/working-hours">
                  <Clock className="mr-2 h-4 w-4" />
                  Manage Working Hours
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};