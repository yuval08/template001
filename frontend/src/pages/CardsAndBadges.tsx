import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/stores/toastStore';
import { 
  Star, 
  Heart, 
  User, 
  MapPin, 
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Loader2,
  Download,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Globe,
  Briefcase,
  Mail
} from 'lucide-react';

const CardsAndBadges: React.FC = () => {
  const [progress, setProgress] = useState(13);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animate progress
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cards & Badges Showcase
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comprehensive examples of cards, badges, avatars, progress indicators, and loading states using Shadcn/ui components.
        </p>
      </div>

      {/* Badge Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>
            Different badge styles for status indicators, labels, and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Basic Variants</h4>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Status Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
                <Badge variant="warning">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Pending
                </Badge>
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Inactive
                </Badge>
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  Scheduled
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Notification Badges</h4>
              <div className="flex flex-wrap gap-4">
                <div className="relative inline-block">
                  <Button variant="outline" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">3</Badge>
                </div>
                <div className="relative inline-block">
                  <Button variant="outline" size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">12</Badge>
                </div>
                <div className="relative inline-block">
                  <Button variant="outline" size="icon">
                    <Users className="h-4 w-4" />
                  </Button>
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">99+</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Interactive Badges</h4>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Vite'].map((tech) => (
                  <Badge 
                    key={tech}
                    variant="outline" 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => toast.info(`Selected: ${tech}`)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <CodeBlock>
{`<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>

{/* Status badge with icon */}
<Badge variant="success">
  <CheckCircle className="mr-1 h-3 w-3" />
  Active
</Badge>

{/* Notification badge */}
<div className="relative inline-block">
  <Button variant="outline" size="icon">
    <Mail className="h-4 w-4" />
  </Button>
  <Badge className="absolute -top-2 -right-2">3</Badge>
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Card Layouts */}
      <Card>
        <CardHeader>
          <CardTitle>Card Layouts</CardTitle>
          <CardDescription>
            Various card layouts for different content types and use cases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Simple Card */}
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>
                  A basic card with just header and content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This is a simple card with minimal content. Perfect for displaying basic information.
                </p>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+20.1%</span> from last month
                </p>
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>

            {/* User Profile Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">John Doe</CardTitle>
                    <CardDescription>Software Engineer</CardDescription>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="success">Online</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    Joined March 2021
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => toast.info('Profile viewed!')}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info('Message sent!')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Card */}
            <Card>
              <CardHeader>
                <div className="aspect-video rounded-md bg-gradient-to-r from-blue-500 to-purple-600"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold">Premium Dashboard</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Advanced analytics and insights for your business.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Featured</Badge>
                    <span className="text-lg font-bold">$99</span>
                  </div>
                  <Button className="w-full" onClick={() => toast.success('Added to cart!')}>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <CodeBlock>
{`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>

{/* Stats card */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">
      +20.1% from last month
    </p>
  </CardContent>
</Card>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Progress Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
          <CardDescription>
            Progress bars, spinners, and loading indicators for showing operation status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Progress Bars</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Upload Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage Used</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Task Completion</span>
                    <span>90%</span>
                  </div>
                  <Progress value={90} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Loading Spinners</h4>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-sm">Custom spinner</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Loading States</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Processing Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Validating payment</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Preparing shipment</span>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Sending confirmation</span>
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Download Center</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span className="text-sm">report.pdf</span>
                        </div>
                        <Badge variant="success">Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">data.xlsx</span>
                        </div>
                        <Badge variant="warning">45%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">backup.zip</span>
                        </div>
                        <Badge variant="outline">Queued</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <CodeBlock>
{`<Progress value={progress} />

{/* Loading spinner */}
<div className="flex items-center gap-2">
  <Loader2 className="h-4 w-4 animate-spin" />
  <span>Loading...</span>
</div>

{/* Custom spinner */}
<div className="h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Skeleton Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Loading States</CardTitle>
          <CardDescription>
            Skeleton screens for better loading experiences and perceived performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoading(!isLoading)}
            >
              Toggle Loading State
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Jane Doe</h4>
                        <p className="text-sm text-gray-600">Product Designer</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Passionate about creating intuitive user experiences and beautiful interfaces.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Article Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-32 w-full rounded-md" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md"></div>
                    <h4 className="font-medium">Getting Started with React</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Learn the fundamentals of React and start building amazing user interfaces.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <CodeBlock>
{`<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-4 w-32" />
<Skeleton className="h-32 w-full rounded-md" />

{/* Skeleton composition */}
<div className="space-y-3">
  <div className="flex items-center space-x-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Avatars */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar Components</CardTitle>
          <CardDescription>
            User avatars with various sizes, fallbacks, and group layouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Avatar Sizes</h4>
              <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <Avatar className="h-12 w-12">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>L</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>XL</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Fallback Examples</h4>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-blue-500 text-white">AB</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-green-500 text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Avatar Groups</h4>
              <div className="flex -space-x-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Avatar key={i} className="border-2 border-white dark:border-gray-900">
                    <AvatarFallback className={`${
                      i === 0 ? 'bg-red-500' : 
                      i === 1 ? 'bg-blue-500' :
                      i === 2 ? 'bg-green-500' : 'bg-purple-500'
                    } text-white`}>
                      {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <Avatar className="border-2 border-white dark:border-gray-900">
                  <AvatarFallback>+3</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Online Status</h4>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-yellow-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>CD</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-gray-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <CodeBlock>
{`<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

{/* Different sizes */}
<Avatar className="h-8 w-8">
  <AvatarFallback>S</AvatarFallback>
</Avatar>

{/* With online status */}
<div className="relative">
  <Avatar>
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Interactive Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Card Examples</CardTitle>
          <CardDescription>
            Cards with actions, hover effects, and user interactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast.info('Card clicked!')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">New</Badge>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium">Clickable Card</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This entire card is clickable and shows a hover effect.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Engagement</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.2%</div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>1.2k views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>89 likes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Quick Actions</h4>
                  <Badge variant="secondary">Pro</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success('Exported!')}>
                    <Download className="mr-2 h-3 w-3" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info('Shared!')}>
                    <Share2 className="mr-2 h-3 w-3" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardsAndBadges;