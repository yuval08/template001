import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/stores/toastStore';
import { PageLayout } from '@/components/common';
import {
  Download,
  Mail,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  ArrowRight,
  Loader2,
  Heart,
  Star,
  ThumbsUp,
  Upload
} from 'lucide-react';

const Buttons: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleAsyncAction = async (buttonId: string, actionName: string) => {
    setLoadingStates(prev => ({ ...prev, [buttonId]: true }));

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setLoadingStates(prev => ({ ...prev, [buttonId]: false }));
    toast.success({ title: `${actionName} completed!` });
  };

  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <PageLayout
      title="Buttons Showcase"
      description="Comprehensive examples of button variants, sizes, states, and interactive patterns using Shadcn/ui components."
      maxWidth="6xl"
    >

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            Different visual styles for various use cases and hierarchies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button variant="default" onClick={() => toast.info({ title: 'Default button clicked!' })}>
              Default
            </Button>
            <Button variant="destructive" onClick={() => toast.error({ title: 'Destructive action!' })}>
              Destructive
            </Button>
            <Button variant="outline" onClick={() => toast.info({ title: 'Outline button clicked!' })}>
              Outline
            </Button>
            <Button variant="secondary" onClick={() => toast.info({ title: 'Secondary button clicked!' })}>
              Secondary
            </Button>
            <Button variant="ghost" onClick={() => toast.info({ title: 'Ghost button clicked!' })}>
              Ghost
            </Button>
            <Button variant="link" onClick={() => toast.info({ title: 'Link button clicked!' })}>
              Link
            </Button>
          </div>

          <CodeBlock>
{`<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Button Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Button Sizes</CardTitle>
          <CardDescription>
            Different sizes to fit various layout requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Button size="sm" onClick={() => toast.info({ title: 'Small button clicked!' })}>
              Small
            </Button>
            <Button size="default" onClick={() => toast.info({ title: 'Default size clicked!' })}>
              Default
            </Button>
            <Button size="lg" onClick={() => toast.info({ title: 'Large button clicked!' })}>
              Large
            </Button>
            <Button size="icon" onClick={() => toast.info({ title: 'Icon button clicked!' })}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <CodeBlock>
{`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Settings className="h-4 w-4" />
</Button>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Button States */}
      <Card>
        <CardHeader>
          <CardTitle>Button States</CardTitle>
          <CardDescription>
            Interactive states including loading and disabled states.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => toast.success({ title: 'Active button clicked!' })}>
              Active
            </Button>
            <Button disabled>
              Disabled
            </Button>
            <Button
              disabled={loadingStates.loading1}
              onClick={() => handleAsyncAction('loading1', 'Save operation')}
            >
              {loadingStates.loading1 ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              disabled={loadingStates.loading2}
              onClick={() => handleAsyncAction('loading2', 'Delete operation')}
            >
              {loadingStates.loading2 ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>

          <CodeBlock>
{`// Normal state
<Button>Active</Button>

// Disabled state
<Button disabled>Disabled</Button>

// Loading state
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Buttons with Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons with Icons</CardTitle>
          <CardDescription>
            Icons can be positioned before, after, or as the sole content of buttons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Icons on the left */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Left Icons</h4>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => toast.info({ title: 'Download started!' })}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => toast.info({ title: 'Email sent!' })}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="secondary" onClick={() => toast.success({ title: 'Item added!' })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Icons on the right */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Right Icons</h4>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => toast.info({ title: 'Proceeding...' })}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => toast.info({ title: 'Searching...' })}>
                  Search
                  <Search className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Icon only buttons */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Icon Only</h4>
              <div className="flex gap-3">
                <Button size="icon" onClick={() => toast.info({ title: 'Settings opened!' })}>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => toast.success({ title: 'Liked!' })}>
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => toast.warning({ title: 'Starred!' })}>
                  <Star className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={() => toast.info({ title: 'Upvoted!' })}>
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <CodeBlock>
{`// Left icon
<Button>
  <Download className="mr-2 h-4 w-4" />
  Download
</Button>

// Right icon
<Button>
  Continue
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>

// Icon only
<Button size="icon">
  <Settings className="h-4 w-4" />
</Button>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Button Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Button Groups</CardTitle>
          <CardDescription>
            Group related buttons together for better organization and visual hierarchy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Horizontal group */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Horizontal Group</h4>
              <div className="flex rounded-md shadow-sm" role="group">
                <Button
                  variant="outline"
                  className="rounded-r-none border-r-0"
                  onClick={() => toast.info({ title: 'Previous page' })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="rounded-none border-r-0"
                  onClick={() => toast.info({ title: 'Current: Page 2' })}
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  className="rounded-l-none"
                  onClick={() => toast.info({ title: 'Next page' })}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Action group */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Action Group</h4>
              <div className="flex gap-2">
                <Button onClick={() => toast.success({ title: 'Document saved!' })}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => toast.info({ title: 'Preview opened!' })}>
                  Preview
                </Button>
                <Button variant="ghost" onClick={() => toast.warning({ title: 'Action cancelled!' })}>
                  Cancel
                </Button>
              </div>
            </div>

            {/* Primary/Secondary action pattern */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Primary/Secondary Actions</h4>
              <div className="flex gap-3">
                <Button onClick={() => toast.success({ title: 'Form submitted!' })}>
                  Submit Form
                </Button>
                <Button variant="outline" onClick={() => toast.info({ title: 'Draft saved!' })}>
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>

          <CodeBlock>
{`// Button group
<div className="flex rounded-md shadow-sm" role="group">
  <Button variant="outline" className="rounded-r-none border-r-0">
    Previous
  </Button>
  <Button variant="outline" className="rounded-none border-r-0">
    2
  </Button>
  <Button variant="outline" className="rounded-l-none">
    Next
  </Button>
</div>

// Action group
<div className="flex gap-2">
  <Button>Save</Button>
  <Button variant="outline">Preview</Button>
  <Button variant="ghost">Cancel</Button>
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Button as Child (Custom Components) */}
      <Card>
        <CardHeader>
          <CardTitle>Button as Child (asChild prop)</CardTitle>
          <CardDescription>
            Use the asChild prop to render custom components with button styling. The asChild prop requires exactly one child element.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
{/*            <Button asChild>*/}
{/*              <a */}
{/*                href="https://github.com" */}
{/*                target="_blank" */}
{/*                rel="noopener noreferrer"*/}
{/*                className="inline-flex items-center"*/}
{/*              >*/}
{/*                <Settings className="mr-2 h-4 w-4" />*/}
{/*                External Link*/}
{/*              </a>*/}
{/*            </Button>*/}
{/*            */}
{/*            <Button variant="outline" asChild>*/}
{/*              <a href="#section1">*/}
{/*                Internal Anchor*/}
{/*              </a>*/}
{/*            </Button>*/}
{/*            */}
{/*            <Button variant="secondary" asChild>*/}
{/*              <label */}
{/*                htmlFor="file-input" */}
{/*                className="cursor-pointer inline-flex items-center"*/}
{/*              >*/}
{/*                <Upload className="mr-2 h-4 w-4" />*/}
{/*                Upload File*/}
{/*              </label>*/}
{/*            </Button>*/}
{/*            <input */}
{/*              id="file-input" */}
{/*              type="file" */}
{/*              className="hidden" */}
{/*              onChange={(e) => {*/}
{/*                if (e.target.files?.[0]) {*/}
{/*                  toast.success({ title: `File selected: ${e.target.files[0].name}` });*/}
{/*                }*/}
{/*              }}*/}
{/*            />*/}
{/*            */}
{/*            <Button variant="ghost" asChild>*/}
{/*              <div */}
{/*                className="cursor-pointer inline-flex items-center"*/}
{/*                onClick={() => toast.info({ title: 'Custom div button clicked!' })}*/}
{/*                role="button"*/}
{/*                tabIndex={0}*/}
{/*                onKeyDown={(e) => {*/}
{/*                  if (e.key === 'Enter' || e.key === ' ') {*/}
{/*                    e.preventDefault();*/}
{/*                    toast.info({ title: 'Custom div button clicked!' });*/}
{/*                  }*/}
{/*                }}*/}
{/*              >*/}
{/*                <Heart className="mr-2 h-4 w-4" />*/}
{/*                Custom Div*/}
{/*              </div>*/}
{/*            </Button>*/}
          </div>

          <CodeBlock>
{`// Button as link - put classes and icons directly on the child
<Button asChild>
  <a 
    href="https://example.com" 
    target="_blank"
    className="inline-flex items-center"
  >
    <Settings className="mr-2 h-4 w-4" />
    External Link
  </a>
</Button>

// Button as label - single child element
<Button asChild>
  <label 
    htmlFor="file-input"
    className="cursor-pointer inline-flex items-center"
  >
    <Upload className="mr-2 h-4 w-4" />
    Upload File
  </label>
</Button>

// Custom div with proper accessibility
<Button asChild>
  <div 
    className="cursor-pointer inline-flex items-center"
    onClick={handleClick}
    role="button"
    tabIndex={0}
    onKeyDown={handleKeyDown}
  >
    <Heart className="mr-2 h-4 w-4" />
    Custom Element
  </div>
</Button>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Interactive Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Examples</CardTitle>
          <CardDescription>
            Real-world button usage patterns with state management and user feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Form Actions</h4>
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info({ title: 'Form reset!' })}
                  >
                    Reset
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.warning({ title: 'Draft saved!' })}
                    >
                      Save Draft
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toast.success({ title: 'Form submitted!' })}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* CRUD operations */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">CRUD Operations</h4>
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info({ title: 'Edit mode activated!' })}
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info({ title: 'Item duplicated!' })}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => toast.error({ title: 'Item deleted!' })}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Patterns & Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Patterns & Testing</CardTitle>
          <CardDescription>
            Complex button patterns including loading states, conditional rendering, and edge cases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            {/* Complex loading states */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Complex Loading States</h4>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={loadingStates.upload}
                  onClick={() => handleAsyncAction('upload', 'Upload')}
                >
                  {loadingStates.upload ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  disabled={loadingStates.download}
                  onClick={() => handleAsyncAction('download', 'Download')}
                >
                  {loadingStates.download ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </>
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  disabled={loadingStates.refresh}
                  onClick={() => handleAsyncAction('refresh', 'Refresh')}
                >
                  {loadingStates.refresh ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Navigation patterns with asChild */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Navigation Patterns (Fixed asChild)</h4>
              <div className="flex flex-wrap gap-3">
{/*                <Button variant="outline" asChild>*/}
{/*                  <a */}
{/*                    href="/dashboard" */}
{/*                    className="inline-flex items-center"*/}
{/*                    onClick={(e) => {*/}
{/*                      e.preventDefault();*/}
{/*                      toast.info({ title: 'Would navigate to /dashboard' });*/}
{/*                    }}*/}
{/*                  >*/}
{/*                    <ArrowRight className="mr-2 h-4 w-4" />*/}
{/*                    Dashboard*/}
{/*                  </a>*/}
{/*                </Button>*/}

{/*                <Button variant="secondary" asChild>*/}
{/*                  <a */}
{/*                    href="/reports" */}
{/*                    className="inline-flex items-center"*/}
{/*                    onClick={(e) => {*/}
{/*                      e.preventDefault();*/}
{/*                      toast.info({ title: 'Would navigate to /reports' });*/}
{/*                    }}*/}
{/*                  >*/}
{/*                    View Reports*/}
{/*                  </a>*/}
{/*                </Button>*/}

{/*                <Button size="sm" asChild>*/}
{/*                  <a */}
{/*                    href="mailto:support@example.com"*/}
{/*                    className="inline-flex items-center"*/}
{/*                  >*/}
{/*                    <Mail className="mr-2 h-4 w-4" />*/}
{/*                    Contact Support*/}
{/*                  </a>*/}
{/*                </Button>*/}
              </div>
            </div>

            {/* Edge cases */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Edge Cases & Accessibility</h4>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => toast.info({ title: 'Very long button text that might wrap to multiple lines in small containers' })}
                  className="max-w-48"
                >
                  Very Long Button Text That Demonstrates Wrapping
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Favorite this item"
                  onClick={() => toast.success({ title: 'Added to favorites!' })}
                >
                  <Heart className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  disabled
                  title="This action is currently unavailable"
                >
                  <Settings className="mr-2 h-4 w-4 opacity-50" />
                  Unavailable Action
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Buttons;