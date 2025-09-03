import React from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UsersListProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  deletingUserId?: string | null;
  isLoading?: boolean;
}

/**
 * UsersList displays user accounts in a responsive grid of cards.
 * It follows the same aesthetic used by StaffList and other admin pages,
 * ensuring the layout gracefully adapts to mobile screens.
 */
export const UsersList: React.FC<UsersListProps> = ({ users, onEdit, onDelete, deletingUserId = null, isLoading=false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      {isLoading ? (
        <Card className="flex items-center justify-center h-36">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </Card>
      ) : users.length === 0 ? (
        <p className="col-span-full text-center text-muted-foreground">No users found.</p>
      ) : (
        users.map((user) => (
          <Card key={user.id} className={`overflow-hidden relative ${deletingUserId===user.id ? 'opacity-70' : ''}`}>
            {deletingUserId===user.id && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <CardContent className="pt-6 pb-4 px-4 sm:px-6 relative">
              {/* Avatar + action buttons */}
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                      : 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg leading-tight truncate">
                    {user.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                {/* Action buttons visible on md+ */}
                <div className="hidden md:flex gap-2">
                  {onEdit && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Action buttons for mobile (stacked below) */}
              <div className="flex md:hidden justify-end gap-2 mt-4">
                {onEdit && (
                  <Button variant="secondary" size="sm" onClick={() => onEdit(user)} className="w-full">
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(user)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default UsersList; 