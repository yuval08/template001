import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser 
} from '@/hooks/useApi';
import { User } from '@/types';
import { createUserSchema, updateUserSchema, CreateUserData, UpdateUserData } from '@/utils/validation';
import { formatRelativeTime } from '@/utils/formatters';
import { 
  Edit,
  Trash2,
  Search,
  UserPlus,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface UserFormData extends CreateUserData {}
interface UserEditData extends UpdateUserData {}

const availableRoles = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'manager', label: 'Manager', description: 'Project management access' },
  { value: 'user', label: 'User', description: 'Standard user access' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

const Users: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: usersResponse, isLoading, error } = useUsers({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: globalFilter,
    sortBy: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = usersResponse?.data || [];
  const totalCount = usersResponse?.totalCount || 0;

  // Create User Form
  const createForm = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      roles: [],
    },
  });

  // Edit User Form
  const editForm = useForm<UserEditData>({
    resolver: zodResolver(updateUserSchema),
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'firstName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Name
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap">
          {row.original.roles.map((role) => {
            const roleInfo = availableRoles.find(r => r.value === role);
            return (
              <span
                key={role}
                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {roleInfo?.label || role}
              </span>
            );
          })}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Created
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => formatRelativeTime(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUserToDelete(row.original)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  });

  const handleCreateUser = async (data: UserFormData) => {
    try {
      await createUserMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      createForm.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      isActive: user.isActive,
    });
  };

  const handleUpdateUser = async (data: UserEditData) => {
    if (!editingUser) return;
    
    try {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        data,
      });
      setEditingUser(null);
      editForm.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setUserToDelete(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleRoleToggle = (roleValue: string, isChecked: boolean, form: any, fieldName: string) => {
    const currentRoles = form.watch(fieldName) || [];
    let newRoles;
    
    if (isChecked) {
      newRoles = [...currentRoles, roleValue];
    } else {
      newRoles = currentRoles.filter((role: string) => role !== roleValue);
    }
    
    form.setValue(fieldName, newRoles, { shouldValidate: true });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading users: {error.message}</p>
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
            Manage users and their roles within the system.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all users in the system with their roles and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b bg-gray-50 dark:bg-gray-800">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 text-left font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                totalCount
              )}{' '}
              of {totalCount} users
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  createForm.reset();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-firstName">First Name *</Label>
                  <Input
                    id="create-firstName"
                    {...createForm.register('firstName')}
                    className={createForm.formState.errors.firstName ? 'border-red-500' : ''}
                  />
                  {createForm.formState.errors.firstName && (
                    <p className="text-sm text-red-500">
                      {createForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-lastName">Last Name *</Label>
                  <Input
                    id="create-lastName"
                    {...createForm.register('lastName')}
                    className={createForm.formState.errors.lastName ? 'border-red-500' : ''}
                  />
                  {createForm.formState.errors.lastName && (
                    <p className="text-sm text-red-500">
                      {createForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  {...createForm.register('email')}
                  className={createForm.formState.errors.email ? 'border-red-500' : ''}
                />
                {createForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {createForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Roles *</Label>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <div key={role.value} className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id={`create-role-${role.value}`}
                        checked={createForm.watch('roles')?.includes(role.value) || false}
                        onChange={(e) => handleRoleToggle(role.value, e.target.checked, createForm, 'roles')}
                        className="mt-0.5 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <Label htmlFor={`create-role-${role.value}`} className="text-sm font-medium">
                          {role.label}
                        </Label>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {createForm.formState.errors.roles && (
                  <p className="text-sm text-red-500">
                    {createForm.formState.errors.roles.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    createForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit User</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingUser(null);
                  editForm.reset();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    {...editForm.register('firstName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    {...editForm.register('lastName')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <div key={role.value} className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-role-${role.value}`}
                        checked={editForm.watch('roles')?.includes(role.value) || false}
                        onChange={(e) => handleRoleToggle(role.value, e.target.checked, editForm, 'roles')}
                        className="mt-0.5 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <Label htmlFor={`edit-role-${role.value}`} className="text-sm font-medium">
                          {role.label}
                        </Label>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  {...editForm.register('isActive')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-isActive">
                  User is active
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingUser(null);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-4">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold">Delete User</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>? 
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;