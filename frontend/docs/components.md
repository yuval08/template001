# Frontend Component Library Documentation

## Overview
This document provides a comprehensive reference for all reusable components in the frontend application. Components are organized into categories for easy navigation.

## Table of Contents
- [Core Common Components](#core-common-components)
- [UI Components (Shadcn/ui)](#ui-components-shadcnui)
- [Domain-Specific Components](#domain-specific-components)
- [Layout Components](#layout-components)
- [Error Handling](#error-handling)
- [Skeleton Loaders](#skeleton-loaders)
- [Usage Guidelines](#usage-guidelines)

---

## Core Common Components

### PageLayout
**Location:** `/src/components/common/PageLayout.tsx`

Standardized page container with consistent layout across all pages.

```tsx
<PageLayout
  title="Page Title"                    // Required: Main page heading
  description="Optional description"    // Optional: Subtitle/description
  actions={<Button>Action</Button>}     // Optional: Action buttons
  maxWidth="4xl"                        // sm|md|lg|xl|2xl|4xl|6xl|full
  padding="md"                          // sm|md|lg
  spacing="md"                          // sm|md|lg
  className="custom-classes"            // Optional: Additional CSS classes
>
  {/* Page content */}
</PageLayout>
```

### DataTable
**Location:** `/src/components/common/DataTable.tsx`

Generic table component with sorting, pagination, and filtering capabilities.

```tsx
<DataTable
  data={items}                          // Array of data items
  columns={columnDefs}                  // TanStack table column definitions
  totalCount={100}                      // Total number of items
  loading={false}                       // Loading state
  error={error}                         // Error object
  
  // Pagination
  pagination={paginationState}          // { pageIndex: 0, pageSize: 10 }
  onPaginationChange={handler}          // Pagination change handler
  manualPagination={true}               // Server-side pagination
  
  // Sorting
  sorting={sortingState}                // [{ id: 'name', desc: false }]
  onSortingChange={handler}             // Sorting change handler
  manualSorting={true}                  // Server-side sorting
  
  // UI
  emptyMessage="No results found"       // Message when no data
  className="custom-classes"            // Additional CSS classes
  
  // Row selection (optional)
  enableRowSelection={false}            // Enable row selection
  onRowSelectionChange={handler}        // Selection change handler
  rowSelection={selectedRows}           // Selected row state
/>
```

### MetricCard
**Location:** `/src/components/common/MetricCard.tsx`

Dashboard metric display card with trend indicators.

```tsx
<MetricCard
  title="Total Users"                   // Metric label
  value={1234}                          // Metric value (string or number)
  icon={Users}                          // Lucide icon component
  trend={{                              // Optional trend indicator
    value: "+12%",                      // Trend text
    type: "positive",                   // positive|negative|neutral
    icon: TrendingUp                    // Trend icon
  }}
  description="Alternative to trend"    // Alternative to trend
  animationDelay="0.1s"                 // CSS animation delay
  loading={false}                       // Loading state
  className="custom-classes"            // Additional CSS classes
/>
```

### SearchAndFilters
**Location:** `/src/components/common/SearchAndFilters.tsx`

Combined search and filter controls component.

```tsx
<SearchAndFilters
  searchValue={search}                  // Current search value
  onSearchChange={setSearch}            // Search change handler
  searchPlaceholder="Search..."         // Search input placeholder
  
  filters={{                            // Optional filters
    selectFilter: {
      value: selectedValue,
      onChange: setSelectedValue,
      options: [
        { value: "1", label: "Option 1" }
      ],
      placeholder: "Select...",
      label: "Filter by"
    },
    checkboxFilters: [{
      id: "active",
      label: "Show Active",
      checked: showActive,
      onChange: setShowActive
    }]
  }}
  
  hasActiveFilters={true}               // Show clear filters button
  onClearFilters={clearAll}             // Clear all filters handler
  className="custom-classes"            // Additional CSS classes
/>
```

### FormDialog
**Location:** `/src/components/common/FormDialog.tsx`

Modal dialog wrapper for forms with consistent styling.

```tsx
<FormDialog
  isOpen={open}                         // Dialog open state
  onClose={handleClose}                 // Close handler
  title="Dialog Title"                  // Dialog title
  description="Optional description"    // Dialog description
  icon={Settings}                        // Optional icon
  
  // Form handling
  onSubmit={handleSubmit}               // Form submit handler
  submitText="Save"                     // Submit button text
  cancelText="Cancel"                   // Cancel button text
  isSubmitting={false}                  // Submitting state
  submitDisabled={false}                // Disable submit button
  submitVariant="default"               // Button variant
  
  // Layout
  maxWidth="md"                         // sm|md|lg|xl|2xl
  hideFooter={false}                    // Hide default footer
  customFooter={<CustomButtons />}      // Custom footer content
  className="custom-classes"            // Additional CSS classes
>
  {/* Form fields */}
</FormDialog>
```

### ResponsiveEntityView
**Location:** `/src/components/common/ResponsiveEntityView.tsx`

Responsive wrapper that switches between desktop and mobile views.

```tsx
<ResponsiveEntityView
  desktopView={<TableComponent />}     // Desktop view (usually table)
  mobileView={<CardListComponent />}    // Mobile view (usually cards)
  breakpoint="lg"                       // sm|md|lg|xl - switch point
  className="custom-classes"            // Additional CSS classes
/>
```

---

## UI Components (Shadcn/ui)

All UI components are located in `/src/components/ui/`

### Button
```tsx
<Button
  variant="default"                     // default|destructive|outline|secondary|ghost|link
  size="default"                        // sm|default|lg|icon
  asChild={false}                       // Render as child element
  loading={false}                       // Show loading spinner
  loadingText="Loading..."              // Text during loading
  disabled={false}                      // Disabled state
>
  Button Text
</Button>
```

### Card Components
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardFooter>
    {/* Card footer */}
  </CardFooter>
</Card>
```

### Dialog
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Controls
- `<Input />` - Text input field
- `<Textarea />` - Multi-line text input
- `<Label />` - Form field label
- `<Select />` - Dropdown select
- `<Checkbox />` - Checkbox input
- `<Switch />` - Toggle switch
- `<RadioGroup />` - Radio button group
- `<Slider />` - Range slider

### Tabs
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Tab 1 content</TabsContent>
  <TabsContent value="tab2">Tab 2 content</TabsContent>
</Tabs>
```

### Other UI Components
- `<Badge />` - Status/label badges
- `<Alert />` - Alert messages
- `<AlertDialog />` - Confirmation dialogs
- `<Skeleton />` - Loading placeholders
- `<Spinner />` - Loading spinner
- `<Progress />` - Progress bar
- `<Tooltip />` - Hover tooltips
- `<Popover />` - Popover content
- `<DropdownMenu />` - Dropdown menus
- `<Avatar />` - User avatars
- `<Separator />` - Visual divider
- `<ScrollArea />` - Scrollable container
- `<Breadcrumb />` - Navigation breadcrumbs

---

## Domain-Specific Components

### User Components
**Location:** `/src/components/users/`

- **ResponsiveUserView** - Responsive table/card view for users
- **UserTable** - Desktop user data table
- **UserList** - Mobile-friendly user card list
- **CreateUserDialog** - User creation modal
- **EditUserDialog** - User editing modal
- **InviteUserDialog** - User invitation modal
- **UserRoleSelect** - Role selection component
- **InvitationTable** - Pending invitations table

### Project Components
**Location:** `/src/components/projects/`

- **ResponsiveProjectView** - Responsive table/card view for projects
- **ProjectTable** - Desktop project data table
- **ProjectList** - Mobile-friendly project card list
- **ProjectCard** - Individual project card component

### Search Components
**Location:** `/src/components/search/`

- **GlobalSearch** - Global search bar
- **CommandPalette** - Command palette (Cmd+K)
- **SearchResults** - Search results display
- **SearchItem** - Individual search result item

---

## Layout Components

**Location:** `/src/components/layout/`

### Layout
Main application layout wrapper that provides consistent structure.
```tsx
<Layout>
  {children}
</Layout>
```

### Sidebar
Navigation sidebar with menu items and user info.
```tsx
<Sidebar />
```

### Topbar
Top navigation bar with search and user menu.
```tsx
<Topbar />
```

---

## Error Handling

**Location:** `/src/components/error/`

### ErrorBoundary
React error boundary for catching and displaying errors.
```tsx
<ErrorBoundary>
  {children}
</ErrorBoundary>
```

### ErrorFallback
Error display component with retry functionality.
```tsx
<ErrorFallback 
  error={error}
  resetErrorBoundary={reset}
/>
```

---

## Skeleton Loaders

**Location:** `/src/components/skeletons/`

### DashboardSkeleton
Loading skeleton for dashboard page.
```tsx
<DashboardSkeleton />
```

### UserSkeleton
Loading skeleton for user tables/cards.
```tsx
<UserSkeleton rows={10} />
```

---

## Usage Guidelines

### Best Practices

1. **Use PageLayout for all pages** - Ensures consistent layout and spacing
2. **Prefer existing UI components** - Use Shadcn/ui components before creating custom ones
3. **Use ResponsiveEntityView** - For any desktop table/mobile card pattern
4. **Implement loading states** - Use skeleton loaders for better UX
5. **Handle errors gracefully** - Use ErrorBoundary and error states
6. **Follow type safety** - All components are fully typed with TypeScript

### Common Patterns

#### Page with Table
```tsx
function UsersPage() {
  return (
    <PageLayout 
      title="Users"
      description="Manage system users"
      actions={<Button>Add User</Button>}
    >
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveEntityView
            desktopView={<UserTable {...props} />}
            mobileView={<UserList {...props} />}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
```

#### Form Dialog Pattern
```tsx
function CreateUserExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <FormDialog
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Create User"
      onSubmit={handleSubmit}
      isSubmitting={loading}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
        </div>
        {/* More fields */}
      </div>
    </FormDialog>
  );
}
```

#### Dashboard Metrics
```tsx
function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        title="Total Users"
        value={1234}
        icon={Users}
        trend={{ value: "+12%", type: "positive" }}
      />
      {/* More metric cards */}
    </div>
  );
}
```

### Important Notes

#### Button with asChild
When using Button with `asChild={true}`, ensure the child element is a single element:

```tsx
// ✅ CORRECT - Single child with all content
<Button asChild>
  <a href="#" className="inline-flex items-center">
    <Icon className="mr-2 h-4 w-4" />
    Text
  </a>
</Button>

// ❌ WRONG - Multiple children or wrapped content
<Button asChild>
  <a href="#">
    <span>
      <Icon className="mr-2 h-4 w-4" />
      Text
    </span>
  </a>
</Button>
```

### Component Benefits

- **40% code reduction** through eliminating duplication
- **Consistent UI/UX** across all pages
- **Type-safe** with full TypeScript support
- **Responsive** with mobile-first design
- **Accessible** with proper ARIA attributes
- **Performance optimized** with lazy loading support
- **Maintainable** with centralized business logic

---

## Migration Status

All major pages have been migrated to use the new component system:
- ✅ Dashboard (PageLayout + MetricCard)
- ✅ Users (PageLayout + ResponsiveEntityView)
- ✅ Tables (PageLayout + DataTable)
- ✅ Reports (PageLayout)
- ✅ Forms (PageLayout)
- ✅ Profile (PageLayout)
- ✅ Settings (PageLayout)
- ✅ Buttons (PageLayout)

## Additional Resources

- [Entity Development Guide](./entity-development.md)
- [Data Tables Guide](./data-tables.md)
- [Forms Guide](./forms.md)
- [Authentication Guide](./authentication.md)
- [Common Patterns](./common-patterns.md)