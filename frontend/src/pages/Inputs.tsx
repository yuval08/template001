import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BasicInputs } from '@/components/showcase/inputs/BasicInputs';
import { AdvancedInputs } from '@/components/showcase/inputs/AdvancedInputs';
import { FormControls } from '@/components/showcase/inputs/FormControls';
import { InputValidation } from '@/components/showcase/inputs/InputValidation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/stores/toastStore';
import { PageLayout } from '@/components/common';

const Inputs: React.FC = () => {
  const { t } = useTranslation('showcase');
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
    <PageLayout
      title={t('inputs.title')}
      description={t('inputs.description')}
      maxWidth="6xl"
    >

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">{t('inputs.basicInputs.title')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('inputs.advancedInputs.title')}</TabsTrigger>
          <TabsTrigger value="controls">{t('forms.title')}</TabsTrigger>
          <TabsTrigger value="validation">{t('inputs.validation.title')}</TabsTrigger>
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
    </PageLayout>
  );
};

export default Inputs;