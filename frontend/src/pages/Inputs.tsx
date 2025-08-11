import React, { useState } from 'react';
import { BasicInputs } from '@/components/showcase/inputs/BasicInputs';
import { AdvancedInputs } from '@/components/showcase/inputs/AdvancedInputs';
import { FormControls } from '@/components/showcase/inputs/FormControls';
import { InputValidation } from '@/components/showcase/inputs/InputValidation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/stores/toastStore';

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

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmitDemo = () => {
    toast.success({ 
      title: 'Form Demo Submitted', 
      description: 'This is just a demo of the input components.'
    });
  };

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

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Inputs</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="controls">Form Controls</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInputs
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            formData={formData}
            updateFormData={updateFormData}
          />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <AdvancedInputs />
        </TabsContent>

        <TabsContent value="controls" className="mt-6">
          <FormControls
            formData={formData}
            updateFormData={updateFormData}
            sliderValue={sliderValue}
            setSliderValue={setSliderValue}
            rangeValue={rangeValue}
            setRangeValue={setRangeValue}
          />
        </TabsContent>

        <TabsContent value="validation" className="mt-6">
          <InputValidation />
        </TabsContent>
      </Tabs>

      {/* Demo Action */}
      <div className="flex justify-center pt-8">
        <Button onClick={handleSubmitDemo} className="px-8">
          Test Form Submission
        </Button>
      </div>
    </div>
  );
};

export default Inputs;