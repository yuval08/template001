import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface FormControlsProps {
  formData: {
    notifications: boolean;
    marketing: boolean;
    theme: string;
    size: string;
    skills: string[];
    volume: number[];
    brightness: number[];
  };
  updateFormData: (field: string, value: any) => void;
  sliderValue: number[];
  setSliderValue: (value: number[]) => void;
  rangeValue: number[];
  setRangeValue: (value: number[]) => void;
}

export const FormControls: React.FC<FormControlsProps> = ({
  formData,
  updateFormData,
  sliderValue,
  setSliderValue,
  rangeValue,
  setRangeValue,
}) => {
  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Checkbox</CardTitle>
          <CardDescription>Boolean selection inputs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="notifications" 
                checked={formData.notifications}
                onCheckedChange={(checked) => updateFormData('notifications', checked)}
              />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketing" 
                checked={formData.marketing}
                onCheckedChange={(checked) => updateFormData('marketing', checked)}
              />
              <Label htmlFor="marketing">Marketing emails</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="disabled" disabled />
              <Label htmlFor="disabled">Disabled option</Label>
            </div>
          </div>
          <CodeBlock>
{`<div className="flex items-center space-x-2">
  <Checkbox 
    id="notifications" 
    checked={checked}
    onCheckedChange={setChecked}
  />
  <Label htmlFor="notifications">
    Enable notifications
  </Label>
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Radio Group</CardTitle>
          <CardDescription>Single selection from multiple options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Theme Preference</Label>
            <RadioGroup 
              value={formData.theme} 
              onValueChange={(value) => updateFormData('theme', value)}
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

      <Card>
        <CardHeader>
          <CardTitle>Switch</CardTitle>
          <CardDescription>Toggle switch controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch 
                checked={formData.notifications}
                onCheckedChange={(checked) => updateFormData('notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing</Label>
                <p className="text-sm text-muted-foreground">Receive marketing emails</p>
              </div>
              <Switch 
                checked={formData.marketing}
                onCheckedChange={(checked) => updateFormData('marketing', checked)}
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="flex items-center justify-between">
  <div>
    <Label>Notifications</Label>
    <p className="text-sm text-muted-foreground">
      Receive push notifications
    </p>
  </div>
  <Switch 
    checked={checked}
    onCheckedChange={setChecked}
  />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slider</CardTitle>
          <CardDescription>Range selection controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Volume: {sliderValue[0]}</Label>
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Brightness: {formData.brightness[0]}</Label>
              <Slider
                value={formData.brightness}
                onValueChange={(value) => updateFormData('brightness', value)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Range: {rangeValue[0]} - {rangeValue[1]}</Label>
              <Slider
                value={rangeValue}
                onValueChange={setRangeValue}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="space-y-2">
  <Label>Volume: {value[0]}</Label>
  <Slider
    value={value}
    onValueChange={setValue}
    max={100}
    step={1}
    className="w-full"
  />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};