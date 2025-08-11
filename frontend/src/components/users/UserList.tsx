import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, getUserRoleLabel, getUserRoleBadgeColor } from '@/entities/user';
import { formatRelativeTime } from '@/utils/formatters';
import { 
  Edit,
  Trash2,
  Search,
  Shield,
  Mail,
  User as UserIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building,
  Briefcase,
  X,
} from 'lucide-react';

interface UserListProps {
  users: User[];
  totalCount: number;
  loading: boolean;
  error?: Error | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  globalFilter: string;
  currentUserEmail?: string;
  hasActiveFilters?: boolean;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onGlobalFilterChange: (filter: string) => void;
  onClearFilters?: () => void;
  onEditUser: (user: User) => void;
  onEditRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
  canEditUsers: boolean;
}

const UserCard: React.FC<{
  user: User;
  onEditUser: (user: User) => void;
  onEditRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
  canEditUsers: boolean;
  currentUserEmail?: string;
}> = ({ user, onEditUser, onEditRole, onDeleteUser, canEditUsers, currentUserEmail }) => {
  const roleColor = getUserRoleBadgeColor(user.role);
  const isSelf = user.email === currentUserEmail;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <h3 className="font-semibold text-base truncate">
                {user.firstName} {user.lastName}
              </h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              
              {user.department && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{user.department}</span>
                </div>
              )}
              
              {user.jobTitle && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{user.jobTitle}</span>
                </div>
              )}

              {user.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Joined {formatRelativeTime(new Date(user.createdAt))}</span>
              </div>
                )}
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <Badge className={`${roleColor} text-xs`}>
                {getUserRoleLabel(user.role)}
              </Badge>
              
              {canEditUsers && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditUser(user)}
                    className="h-8 w-8 p-0"
                    title="Edit user"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditRole(user)}
                    className="h-8 w-8 p-0"
                    title="Change role"
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteUser(user)}
                    disabled={isSelf}
                    className={`h-8 w-8 p-0 ${isSelf ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`}
                    title={isSelf ? "Cannot delete yourself" : "Delete user"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const UserList: React.FC<UserListProps> = ({
  users,
  totalCount,
  loading,
  error,
  pagination,
  globalFilter,
  currentUserEmail,
  hasActiveFilters,
  onPaginationChange,
  onGlobalFilterChange,
  onClearFilters,
  onEditUser,
  onEditRole,
  onDeleteUser,
  canEditUsers,
}) => {
  const totalPages = Math.ceil(totalCount / pagination.pageSize);
  const startItem = pagination.pageIndex * pagination.pageSize + 1;
  const endItem = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount);

  const handlePreviousPage = () => {
    if (pagination.pageIndex > 0) {
      onPaginationChange({
        ...pagination,
        pageIndex: pagination.pageIndex - 1,
      });
    }
  };

  const handleNextPage = () => {
    if (pagination.pageIndex < totalPages - 1) {
      onPaginationChange({
        ...pagination,
        pageIndex: pagination.pageIndex + 1,
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-red-500">Error loading users: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading users...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {globalFilter ? 'No users found matching your search.' : 'No users found.'}
        </div>
      ) : (
        <>
          {/* User Cards */}
          <div className="space-y-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEditUser={onEditUser}
                onEditRole={onEditRole}
                onDeleteUser={onDeleteUser}
                canEditUsers={canEditUsers}
                currentUserEmail={currentUserEmail}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing {startItem}-{endItem} of {totalCount} users
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={pagination.pageIndex === 0}
                  className="px-3 py-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden xs:inline">Previous</span>
                </Button>
                
                <div className="flex items-center gap-1 px-3">
                  <span className="text-xs sm:text-sm text-gray-600">Page</span>
                  <span className="font-medium text-sm">
                    {pagination.pageIndex + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">of {totalPages}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pagination.pageIndex >= totalPages - 1}
                  className="px-3 py-2"
                >
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {/* Page size selector for mobile */}
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                <span className="text-gray-600">Show:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => {
                    onPaginationChange({
                      ...pagination,
                      pageSize: Number(e.target.value),
                      pageIndex: 0, // Reset to first page when changing page size
                    });
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-gray-600">per page</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};