import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserTable } from '@/components/users/UserTable';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { EditUserDialog } from '@/components/users/EditUserDialog';
import { UserRoleSelect } from '@/components/users/UserRoleSelect';
import { InviteUserDialog } from '@/components/users/InviteUserDialog';
import { InvitationTable } from '@/components/users/InvitationTable';
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUserProfile,
  useUpdateUserRole,
  useInvitations,
  useCreateInvitation,
} from '@/hooks/useUsers';
import { User, CreateUser, UpdateUserProfile, UpdateUserRole, CreateInvitation } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';
import { 
  UserPlus,
  Mail,
  Trash2,
} from 'lucide-react';

type SortingState = Array<{
  id: string;
  desc: boolean;
}>;

const Users: React.FC = () => {
  const { user: currentUser, hasAnyRole } = useAuth();
  const isAdmin = hasAnyRole(['Admin']);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForRoleChange, setUserForRoleChange] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Current tab
  const [currentTab, setCurrentTab] = useState('users');

  // Data fetching
  const { 
    data: usersResponse, 
    isLoading: usersLoading, 
    error: usersError 
  } = useUsers({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: globalFilter,
  });

  const { 
    data: invitationsResponse, 
    isLoading: invitationsLoading, 
    error: invitationsError 
  } = useInvitations({
    pageNumber: 1,
    pageSize: 50,
  });

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserProfileMutation = useUpdateUserProfile();
  const updateUserRoleMutation = useUpdateUserRole();
  const createInvitationMutation = useCreateInvitation();

  const users = usersResponse?.data || [];
  const totalUsersCount = usersResponse?.totalCount || 0;
  const invitations = invitationsResponse?.data || [];
  const totalInvitationsCount = invitationsResponse?.totalCount || 0;

  // Handlers
  const handleCreateUser = async (data: CreateUser) => {
    try {
      await createUserMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleInviteUser = async (data: CreateInvitation) => {
    try {
      await createInvitationMutation.mutateAsync(data);
      setIsInviteModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUserProfile = async (data: UpdateUserProfile) => {
    if (!editingUser) return;
    
    try {
      await updateUserProfileMutation.mutateAsync({
        id: editingUser.id,
        data: {
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          department: data.department,
          jobTitle: data.jobTitle,
          isActive: data.isActive,
        },
      });
      setEditingUser(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditRole = (user: User) => {
    setUserForRoleChange(user);
  };

  const handleUpdateUserRole = async (data: UpdateUserRole) => {
    if (!userForRoleChange) return;
    
    try {
      await updateUserRoleMutation.mutateAsync({
        id: userForRoleChange.id,
        data: {
          userId: data.userId,
          newRole: data.newRole,
          updatedById: data.updatedById,
        },
      });
      setUserForRoleChange(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Note: Delete functionality would need to be implemented in the API
      console.log('Delete user:', userToDelete.id);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage users, roles, and invitations within the system.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Send Invitation
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">
            Users ({totalUsersCount})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Pending Invitations ({totalInvitationsCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage all users in the system, their roles, and profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users}
                totalCount={totalUsersCount}
                loading={usersLoading}
                error={usersError}
                pagination={pagination}
                sorting={sorting}
                globalFilter={globalFilter}
                onPaginationChange={setPagination}
                onSortingChange={setSorting}
                onGlobalFilterChange={setGlobalFilter}
                onEditUser={handleEditUser}
                onEditRole={handleEditRole}
                onDeleteUser={handleDeleteUser}
                canEditUsers={isAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations" className="space-y-4">
          <InvitationTable
            invitations={invitations}
            totalCount={totalInvitationsCount}
            loading={invitationsLoading}
            error={invitationsError}
          />
        </TabsContent>
      </Tabs>

      {/* Create User Modal */}
      <CreateUserDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        isSubmitting={createUserMutation.isPending}
      />

      {/* Invite User Modal */}
      <InviteUserDialog
        currentUserId={currentUser?.id || ''}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteUser}
        isSubmitting={createInvitationMutation.isPending}
      />

      {/* Edit User Modal */}
      <EditUserDialog
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUserProfile}
        isSubmitting={updateUserProfileMutation.isPending}
      />

      {/* Edit Role Modal */}
      <UserRoleSelect
        user={userForRoleChange}
        currentUserId={currentUser?.id || ''}
        isOpen={!!userForRoleChange}
        onClose={() => setUserForRoleChange(null)}
        onSubmit={handleUpdateUserRole}
        isSubmitting={updateUserRoleMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                {userToDelete?.firstName} {userToDelete?.lastName}
              </strong>
              ? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;