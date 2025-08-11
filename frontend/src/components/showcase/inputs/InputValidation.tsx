import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/stores/toastStore';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const InputValidation: React.FC = () => {
  const [validationState, setValidationState] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    emailValid: null as boolean | null,
    passwordValid: null as boolean | null,
    passwordMatch: null as boolean | null,
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleEmailChange = (email: string) => {
    setValidationState(prev => ({
      ...prev,
      email,
      emailValid: email ? validateEmail(email) : null
    }));
  };

  const handlePasswordChange = (password: string) => {
    setValidationState(prev => ({
      ...prev,
      password,
      passwordValid: password ? validatePassword(password) : null,
      passwordMatch: prev.confirmPassword ? password === prev.confirmPassword : null
    }));
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setValidationState(prev => ({
      ...prev,
      confirmPassword,
      passwordMatch: confirmPassword ? prev.password === confirmPassword : null
    }));
  };

  const getValidationIcon = (isValid: boolean | null) => {
    if (isValid === null) return null;
    return isValid ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );
  };

  const getInputClassName = (isValid: boolean | null) => {
    if (isValid === null) return '';
    return isValid ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500';
  };

  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Validation</CardTitle>
          <CardDescription>Input validation with visual feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-validation">Email</Label>
            <div className="relative">
              <Input
                id="email-validation"
                type="email"
                value={validationState.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Enter your email"
                className={`pr-10 ${getInputClassName(validationState.emailValid)}`}
              />
              <div className="absolute right-2 top-2.5">
                {getValidationIcon(validationState.emailValid)}
              </div>
            </div>
            {validationState.emailValid === false && (
              <p className="text-sm text-red-500">Please enter a valid email address</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-validation">Password</Label>
            <div className="relative">
              <Input
                id="password-validation"
                type="password"
                value={validationState.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter password"
                className={`pr-10 ${getInputClassName(validationState.passwordValid)}`}
              />
              <div className="absolute right-2 top-2.5">
                {getValidationIcon(validationState.passwordValid)}
              </div>
            </div>
            {validationState.passwordValid === false && (
              <p className="text-sm text-red-500">Password must be at least 8 characters</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type="password"
                value={validationState.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="Confirm password"
                className={`pr-10 ${getInputClassName(validationState.passwordMatch)}`}
              />
              <div className="absolute right-2 top-2.5">
                {getValidationIcon(validationState.passwordMatch)}
              </div>
            </div>
            {validationState.passwordMatch === false && (
              <p className="text-sm text-red-500">Passwords do not match</p>
            )}
          </div>

          <CodeBlock>
{`const [isValid, setIsValid] = useState(null);

const validateEmail = (email) => {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
};

<div className="relative">
  <Input
    className={isValid ? 'border-green-500' : 'border-red-500'}
    onChange={(e) => setIsValid(validateEmail(e.target.value))}
  />
  <div className="absolute right-2 top-2.5">
    {isValid ? <CheckCircle /> : <X />}
  </div>
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input States</CardTitle>
          <CardDescription>Different input states and feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="success">Success State</Label>
              <div className="relative">
                <Input
                  id="success"
                  value="valid@example.com"
                  className="border-green-500 focus:ring-green-500"
                  readOnly
                />
                <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm text-green-600">Email is valid</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="error">Error State</Label>
              <div className="relative">
                <Input
                  id="error"
                  value="invalid-email"
                  className="border-red-500 focus:ring-red-500"
                  readOnly
                />
                <X className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
              </div>
              <p className="text-sm text-red-600">Invalid email format</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warning">Warning State</Label>
              <div className="relative">
                <Input
                  id="warning"
                  value="test@test"
                  className="border-yellow-500 focus:ring-yellow-500"
                  readOnly
                />
                <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-sm text-yellow-600">Email might be incomplete</p>
            </div>
          </div>

          <CodeBlock>
{`// Success state
<Input className="border-green-500 focus:ring-green-500" />
<p className="text-sm text-green-600">Success message</p>

// Error state
<Input className="border-red-500 focus:ring-red-500" />
<p className="text-sm text-red-600">Error message</p>

// Warning state
<Input className="border-yellow-500 focus:ring-yellow-500" />
<p className="text-sm text-yellow-600">Warning message</p>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};