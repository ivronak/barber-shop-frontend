import React, { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { UsersList } from './UsersList';
import { UsersTable } from './UsersTable';
import {
   getAllUsers,
   deleteUser,
   createUser,
   updateUser,
 } from '@/api/services/userService';
import { User } from '@/types';
import { PageHeader } from '@/components/layout';
import { useToast } from '@/hooks/use-toast';
import AddUserDialog, { AddUserPayload } from './AddUserDialog';
import EditUserDialog, { EditUserPayload } from './EditUserDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const UsersPage: React.FC = () => {
  const { toast } = useToast();

  // API hooks using generic useApi helper
  const {
    data: usersResponse,
    loading,
    error,
    execute: fetchUsers
  } = useApi(getAllUsers);

  const { execute: executeDeleteUser } = useApi(deleteUser);

  // Local state
  const [debouncedSearch] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users on mount & whenever debouncedSearch changes
  useEffect(() => {
    const LIMIT = 100;
    fetchUsers(1, LIMIT, debouncedSearch, 'admin');
  }, [fetchUsers, debouncedSearch]);

  // Handlers
  const handleAddUser = () => setShowAddDialog(true);

  const handleAddUserSave = async (payload: AddUserPayload) => {
    try {
      await createUser(payload);
      toast({ title: 'User added' });
      fetchUsers(1, 100, debouncedSearch, 'admin');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : 'Failed to create user';
      toast({ variant: 'destructive', title: 'Error', description: msg });
      throw err;
    }
  };

  const handleEditUser = async (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleEditUserSave = async (payload: EditUserPayload) => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, payload);
      toast({ title: 'User updated' });
      fetchUsers(1, 100, debouncedSearch, 'admin');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : 'Failed to update user';
      toast({ variant: 'destructive', title: 'Error', description: msg });
      throw err;
    }
  };

  const handleDeleteUser = async (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsDeleting(true);
      setDeletingUserId(selectedUser.id);
      await executeDeleteUser(selectedUser.id);
      toast({ title: 'User deleted' });
      fetchUsers(1, 100, debouncedSearch, 'admin');
      setShowDeleteDialog(false);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : 'Failed to delete user';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsDeleting(false);
      setDeletingUserId(null);
    }
  };

  // Get users list from response
  const users: User[] = (usersResponse?.success ? usersResponse.users : []).filter(u => u.role !== 'staff');

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Create, edit and remove system users."
        action={{
          label: 'Add User',
          onClick: handleAddUser,
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />

      {/* Error state */}
      {error && (
        <p className="text-destructive">{error.message || 'Failed to load users'}</p>
      )}

      {/* Data */}
      {(
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <UsersTable
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              deletingUserId={deletingUserId}
              isLoading={loading}
            />
          </div>

          {/* Mobile card list */}
          <div className="md:hidden">
            <UsersList
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              deletingUserId={deletingUserId}
              isLoading={loading}
            />
          </div>

          {/* Empty state when not loading and no users */}
          {!loading && users.length === 0 && (
            <p className="text-center text-muted-foreground pt-6">No users found.</p>
          )}
        </>
      )}

      {/* Dialogs */}
      <AddUserDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddUserSave} />

      {selectedUser && (
        <EditUserDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          user={selectedUser}
          onSave={handleEditUserSave}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={(o) => !isDeleting && setShowDeleteDialog(o)}>
        <AlertDialogContent className="rounded-lg sm:rounded-lg p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete user "{selectedUser?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
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

export default UsersPage; 