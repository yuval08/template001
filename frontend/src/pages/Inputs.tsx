import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/stores/toastStore';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  Mail,
  Phone,
  Lock,
  CreditCard,
  MapPin,
  Globe,
  Palette,
  Volume2,
  Sun,
  Wifi,
  Bell,
  Shield,
  Zap
} from 'lucide-react';

const Inputs: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    age: 25,
    volume: [50],
    brightness: [75],
    notifications: true,
    marketing: false,
    theme: 'light',
    size: 'medium',
    skills: [] as string[],
    bio: ''
  });

  const [sliderValue, setSliderValue] = useState([50]);
  const [rangeValue, setRangeValue] = useState([20, 80]);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Input Components Showcase
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comprehensive examples of input fields, form controls, and interactive elements using Shadcn/ui components.
        </p>
      </div>

      {/* Basic Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Input Fields</CardTitle>
          <CardDescription>
            Standard input fields with various types and states.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="text-input">Text Input</Label>
                <Input
                  id="text-input"
                  placeholder="Enter text here..."
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="email-input">Email Input</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email-input"
                    type="email"
                    placeholder="Enter email address"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password-input">Password Input</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="search-input">Search Input</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search-input"
                    placeholder="Search..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone-input">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone-input"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="url-input">Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="number-input">Age</Label>
                <Input
                  id="number-input"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="date-input">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="date-input"
                    type="date"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <CodeBlock>
{`<Input placeholder="Enter text here..." />

{/* Input with icon */}
<div className="relative">
  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
  <Input type="email" placeholder="Email" className="pl-10" />
</div>

{/* Password input with toggle */}
<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    className="pr-10"
  />
  <Button
    variant="ghost"
    size="icon"
    className="absolute right-1 top-1"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff /> : <Eye />}
  </Button>
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Input States */}
      <Card>
        <CardHeader>
          <CardTitle>Input States & Validation</CardTitle>
          <CardDescription>
            Different input states including disabled, error, and success states.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="normal-state">Normal State</Label>
                <Input id="normal-state" placeholder="Normal input" />
              </div>

              <div>
                <Label htmlFor="disabled-state">Disabled State</Label>
                <Input id="disabled-state" placeholder="Disabled input" disabled />
              </div>

              <div>
                <Label htmlFor="error-state" className="text-red-500">Error State</Label>
                <Input 
                  id="error-state" 
                  placeholder="Invalid input" 
                  className="border-red-500 focus:border-red-500 focus:ring-red-500" 
                />
                <p className="text-sm text-red-500 mt-1">This field is required</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="success-state" className="text-green-500">Success State</Label>
                <Input 
                  id="success-state" 
                  placeholder="Valid input" 
                  className="border-green-500 focus:border-green-500 focus:ring-green-500" 
                  defaultValue="valid@example.com"
                />
                <p className="text-sm text-green-500 mt-1">Looks good!</p>
              </div>

              <div>
                <Label htmlFor="readonly-state">Read-only State</Label>
                <Input 
                  id="readonly-state" 
                  value="Read-only value" 
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800" 
                />
              </div>

              <div>
                <Label htmlFor="loading-state">Loading State</Label>
                <div className="relative">
                  <Input id="loading-state" placeholder="Loading..." />
                  <div className="absolute right-3 top-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CodeBlock>
{`{/* Normal state */}
<Input placeholder="Normal input" />

{/* Disabled state */}
<Input placeholder="Disabled input" disabled />

{/* Error state */}
<Input 
  placeholder="Invalid input" 
  className="border-red-500 focus:border-red-500" 
/>

{/* Success state */}
<Input 
  className="border-green-500 focus:border-green-500" 
  defaultValue="valid@example.com"
/>

{/* Read-only state */}
<Input value="Read-only value" readOnly />`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Checkboxes */}
      <Card>
        <CardHeader>
          <CardTitle>Checkboxes</CardTitle>
          <CardDescription>
            Checkbox components for binary choices and multi-selection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Basic Checkboxes</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="marketing" 
                    checked={formData.marketing}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, marketing: !!checked }))
                    }
                  />
                  <Label htmlFor="marketing">Subscribe to marketing emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="updates" defaultChecked />
                  <Label htmlFor="updates">Receive product updates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disabled-checkbox" disabled />
                  <Label htmlFor="disabled-checkbox" className="text-gray-400">Disabled option</Label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Skill Selection</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['React', 'TypeScript', 'Node.js', 'Python', 'Design', 'DevOps'].map(skill => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox 
                      id={skill}
                      checked={formData.skills.includes(skill)}
                      onCheckedChange={() => handleSkillToggle(skill)}
                    />
                    <Label htmlFor={skill} className="text-sm">{skill}</Label>
                  </div>
                ))}
              </div>
              {formData.skills.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Selected: {formData.skills.join(', ')}
                </p>
              )}
            </div>
          </div>

          <CodeBlock>
{`<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>

{/* Controlled checkbox */}
<Checkbox 
  checked={isChecked}
  onCheckedChange={setIsChecked}
/>

{/* Disabled checkbox */}
<Checkbox disabled />`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Radio Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Radio Groups</CardTitle>
          <CardDescription>
            Radio button groups for single selection from multiple options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Theme Preference</Label>
              <RadioGroup 
                value={formData.theme} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">System</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">T-Shirt Size</Label>
              <RadioGroup 
                value={formData.size} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
                className="mt-2"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['small', 'medium', 'large', 'extra-large'].map(size => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem value={size} id={size} />
                      <Label htmlFor={size} className="capitalize">
                        {size.replace('-', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Plan Selection</Label>
              <RadioGroup defaultValue="pro" className="mt-2">
                <div className="space-y-3">
                  {[
                    { value: 'free', label: 'Free', description: 'Basic features for personal use' },
                    { value: 'pro', label: 'Pro', description: 'Advanced features for professionals' },
                    { value: 'team', label: 'Team', description: 'Collaboration tools for teams' }
                  ].map(plan => (
                    <div key={plan.value} className="flex items-start space-x-2">
                      <RadioGroupItem value={plan.value} id={plan.value} className="mt-1" />
                      <div>
                        <Label htmlFor={plan.value} className="font-medium">{plan.label}</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>

          <CodeBlock>
{`<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="light" id="light" />
    <Label htmlFor="light">Light</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="dark" id="dark" />
    <Label htmlFor="dark">Dark</Label>
  </div>
</RadioGroup>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Switches */}
      <Card>
        <CardHeader>
          <CardTitle>Switch Components</CardTitle>
          <CardDescription>
            Toggle switches for on/off states and feature toggles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <Switch 
                    id="notifications"
                    checked={formData.notifications}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="location">Location Services</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow location access for better experience
                    </p>
                  </div>
                  <Switch id="location" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Analytics</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Help improve our service by sharing usage data
                    </p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label>Email Notifications</Label>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <Label>Two-Factor Authentication</Label>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4" />
                    <Label>Auto-Connect WiFi</Label>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-gray-400" />
                    <Label className="text-gray-400">Battery Saver (Disabled)</Label>
                  </div>
                  <Switch disabled />
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Current Settings</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notifications: {formData.notifications ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>

          <CodeBlock>
{`<Switch defaultChecked />

{/* Controlled switch */}
<Switch 
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
/>

{/* Disabled switch */}
<Switch disabled />

{/* Switch with label */}
<div className="flex items-center justify-between">
  <Label htmlFor="notifications">Push Notifications</Label>
  <Switch id="notifications" />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Sliders */}
      <Card>
        <CardHeader>
          <CardTitle>Slider Components</CardTitle>
          <CardDescription>
            Range sliders for numeric input and value selection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Volume</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">{sliderValue[0]}%</span>
              </div>
              <div className="flex items-center space-x-4">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400">100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Brightness</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">{formData.brightness[0]}%</span>
              </div>
              <div className="flex items-center space-x-4">
                <Sun className="h-4 w-4" />
                <Slider
                  value={formData.brightness}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, brightness: value }))}
                  max={100}
                  step={5}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Price Range</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ${rangeValue[0]} - ${rangeValue[1]}
                </span>
              </div>
              <Slider
                value={rangeValue}
                onValueChange={setRangeValue}
                min={0}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$0</span>
                <span>$1000</span>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Temperature</Label>
              <Slider
                defaultValue={[20]}
                min={-10}
                max={50}
                step={1}
                className="w-full"
                onValueChange={(value) => toast.info({ title: `Temperature: ${value[0]}°C` })}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>-10°C</span>
                <span>0°C</span>
                <span>25°C</span>
                <span>50°C</span>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Disabled Slider</Label>
              <Slider
                defaultValue={[30]}
                max={100}
                step={1}
                disabled
                className="w-full opacity-50"
              />
            </div>
          </div>

          <CodeBlock>
{`<Slider
  value={value}
  onValueChange={setValue}
  max={100}
  step={1}
/>

{/* Range slider */}
<Slider
  value={[min, max]}
  onValueChange={setRange}
  min={0}
  max={1000}
  step={10}
/>

{/* Disabled slider */}
<Slider defaultValue={[30]} disabled />`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Advanced Input Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Input Patterns</CardTitle>
          <CardDescription>
            Complex input patterns and combinations for real-world use cases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="credit-card">Credit Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="credit-card"
                    placeholder="1234 5678 9012 3456"
                    className="pl-10"
                    maxLength={19}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={3}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="Enter your address"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="color-picker">Favorite Color</Label>
                <div className="relative">
                  <Palette className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="color-picker"
                    type="color"
                    className="pl-10 h-12 cursor-pointer"
                    defaultValue="#3b82f6"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="time-input">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="time-input"
                    type="time"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file-input">File Upload</Label>
                <Input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      toast.success({ title: `Selected ${files.length} file(s)` });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={() => {
                toast.success({ title: 'Form submitted!', description: 'All input values have been captured.' });
              }}
              className="w-full md:w-auto"
            >
              Submit All Inputs
            </Button>
          </div>

          <CodeBlock>
{`{/* Input with custom styling */}
<div className="relative">
  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
  <Input
    placeholder="1234 5678 9012 3456"
    className="pl-10"
    maxLength={19}
  />
</div>

{/* Color input */}
<Input
  type="color"
  className="h-12 cursor-pointer"
  defaultValue="#3b82f6"
/>

{/* File input */}
<Input
  type="file"
  multiple
  accept="image/*,.pdf,.doc,.docx"
/>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inputs;