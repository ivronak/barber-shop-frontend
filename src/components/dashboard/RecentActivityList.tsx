import React from 'react';
import { format } from 'date-fns';
import { Log } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { staffData, adminUser } from '@/mocks';

interface RecentActivityListProps {
  logs: Log[];
  title: string;
  className?: string;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  logs,
  title,
  className,
}) => {
  // Get user image
  const getUserImage = (userId: string) => {
    if (userId === 'admin-1') {
      return adminUser.image;
    }
    
    const staff = staffData.find(s => s.id === userId);
    return staff?.image;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getUserImage(log.userId)} />
                <AvatarFallback>
                  {log.userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="text-sm">
                  <span className="font-medium">{log.userName}</span>
                  <span className="text-muted-foreground"> {log.action.toLowerCase()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{log.details}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};