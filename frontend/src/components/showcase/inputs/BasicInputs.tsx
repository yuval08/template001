import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface BasicInputsProps {
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  formData: {
    email: string;
    password: string;
  };
  updateFormData: (field: string, value: any) => void;
}

export const BasicInputs: React.FC<BasicInputsProps> = ({
  showPassword,
  togglePasswordVisibility,
  formData,
  updateFormData,
}) => {
  const { t } = useTranslation('showcase');
  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('forms.textInputs.textInput')}</CardTitle>
          <CardDescription>{t('inputs.basicInputs.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="basic">{t('forms.textInputs.textInput')}</Label>
            <Input id="basic" placeholder={t('forms.textInputs.textPlaceholder')} />
          </div>
          <CodeBlock>
{`<Input 
  placeholder="Enter text here..." 
/>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('forms.textInputs.textInput')}</CardTitle>
          <CardDescription>{t('inputs.basicInputs.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="labeled">{t('tables.columns.name')}</Label>
            <Input id="labeled" placeholder="John Doe" />
          </div>
          <CodeBlock>
{`<Label htmlFor="labeled">Full Name</Label>
<Input 
  id="labeled" 
  placeholder="John Doe" 
/>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('buttons.actions.search')}</CardTitle>
          <CardDescription>{t('inputs.basicInputs.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('tables.search')} className="pl-8" />
          </div>
          <CodeBlock>
{`<div className="relative">
  <Search className="absolute left-2 top-2.5 h-4 w-4" />
  <Input placeholder="Search..." className="pl-8" />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('forms.textInputs.emailInput')}</CardTitle>
          <CardDescription>{t('inputs.validation.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('tables.columns.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder={t('forms.textInputs.emailPlaceholder')}
                className="pl-8"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <Mail className="absolute left-2 top-2.5 h-4 w-4" />
  <Input 
    type="email" 
    placeholder="john@example.com" 
    className="pl-8" 
  />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('forms.textInputs.passwordInput')}</CardTitle>
          <CardDescription>{t('inputs.validation.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t('forms.textInputs.passwordInput')}</Label>
            <div className="relative">
              <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                placeholder={t('forms.textInputs.passwordPlaceholder')}
                className="pl-8 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <Lock className="absolute left-2 top-2.5 h-4 w-4" />
  <Input 
    type={showPassword ? "text" : "password"}
    className="pl-8 pr-10" 
  />
  <button onClick={togglePasswordVisibility}>
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('forms.textInputs.disabledInput')}</CardTitle>
          <CardDescription>{t('inputs.basicInputs.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disabled">{t('forms.textInputs.disabledInput')}</Label>
            <Input id="disabled" placeholder={t('forms.textInputs.disabledPlaceholder')} disabled />
          </div>
          <CodeBlock>
{`<Input 
  placeholder="Cannot edit this" 
  disabled 
/>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};