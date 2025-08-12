import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Terminal, 
  CheckCircle2, 
  Info,
  AlertTriangle,
  Download,
  Settings
} from 'lucide-react';
import { toast } from '@/stores/toastStore';

const UIShowcase: React.FC = () => {
  const { t } = useTranslation('showcase');
  const [switchState, setSwitchState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [progressValue, setProgressValue] = useState(66);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('ui.title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('ui.description')}
        </p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="buttons">{t('ui.tabs.buttons')}</TabsTrigger>
          <TabsTrigger value="forms">{t('ui.tabs.forms')}</TabsTrigger>
          <TabsTrigger value="feedback">{t('ui.tabs.feedback')}</TabsTrigger>
          <TabsTrigger value="display">{t('ui.tabs.display')}</TabsTrigger>
          <TabsTrigger value="layout">{t('ui.tabs.layout')}</TabsTrigger>
          <TabsTrigger value="navigation">{t('ui.tabs.navigation')}</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('buttons.title')}</CardTitle>
              <CardDescription>{t('buttons.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Button Variants */}
              <div>
                <h3 className="text-sm font-medium mb-3">{t('buttons.variants.title')}</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>{t('buttons.variants.default')}</Button>
                  <Button variant="secondary">{t('buttons.variants.secondary')}</Button>
                  <Button variant="destructive">{t('buttons.variants.destructive')}</Button>
                  <Button variant="outline">{t('buttons.variants.outline')}</Button>
                  <Button variant="ghost">{t('buttons.variants.ghost')}</Button>
                  <Button variant="link">{t('buttons.variants.link')}</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h3 className="text-sm font-medium mb-3">{t('buttons.sizes.title')}</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">{t('buttons.sizes.small')}</Button>
                  <Button size="default">{t('buttons.sizes.default')}</Button>
                  <Button size="lg">{t('buttons.sizes.large')}</Button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h3 className="text-sm font-medium mb-3">{t('buttons.states.title')}</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>{t('buttons.states.active')}</Button>
                  <Button disabled>{t('buttons.states.disabled')}</Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    {t('buttons.states.withIcon')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('badges.title')}</CardTitle>
              <CardDescription>{t('badges.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge>{t('badges.variants.default')}</Badge>
                <Badge variant="secondary">{t('badges.variants.secondary')}</Badge>
                <Badge variant="destructive">{t('badges.variants.destructive')}</Badge>
                <Badge variant="outline">{t('badges.variants.outline')}</Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-green-500 hover:bg-green-600">{t('badges.variants.success')}</Badge>
                <Badge className="bg-yellow-500 hover:bg-yellow-600">{t('badges.variants.warning')}</Badge>
                <Badge className="bg-blue-500 hover:bg-blue-600">{t('badges.variants.info')}</Badge>
                <Badge className="bg-purple-500 hover:bg-purple-600">{t('badges.variants.purple')}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('forms.title')}</CardTitle>
              <CardDescription>{t('forms.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Inputs */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-input">{t('forms.textInputs.textInput')}</Label>
                  <Input id="text-input" placeholder={t('forms.textInputs.textPlaceholder')} />
                </div>
                
                <div>
                  <Label htmlFor="email-input">{t('forms.textInputs.emailInput')}</Label>
                  <Input id="email-input" type="email" placeholder={t('forms.textInputs.emailPlaceholder')} />
                </div>

                <div>
                  <Label htmlFor="password-input">{t('forms.textInputs.passwordInput')}</Label>
                  <Input id="password-input" type="password" placeholder={t('forms.textInputs.passwordPlaceholder')} />
                </div>

                <div>
                  <Label htmlFor="disabled-input">{t('forms.textInputs.disabledInput')}</Label>
                  <Input id="disabled-input" placeholder={t('forms.textInputs.disabledPlaceholder')} disabled />
                </div>

                <div>
                  <Label htmlFor="textarea">{t('forms.textInputs.textarea')}</Label>
                  <Textarea id="textarea" placeholder={t('forms.textInputs.textareaPlaceholder')} rows={4} />
                </div>
              </div>

              {/* Select */}
              <div>
                <Label htmlFor="select">{t('forms.select.title')}</Label>
                <Select value={selectedValue} onValueChange={setSelectedValue}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('forms.select.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t('forms.select.fruits')}</SelectLabel>
                      <SelectItem value="apple">{t('forms.select.options.apple')}</SelectItem>
                      <SelectItem value="banana">{t('forms.select.options.banana')}</SelectItem>
                      <SelectItem value="orange">{t('forms.select.options.orange')}</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>{t('forms.select.vegetables')}</SelectLabel>
                      <SelectItem value="carrot">{t('forms.select.options.carrot')}</SelectItem>
                      <SelectItem value="potato">{t('forms.select.options.potato')}</SelectItem>
                      <SelectItem value="tomato">{t('forms.select.options.tomato')}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Checkbox */}
              <div className="space-y-3">
                <Label>{t('forms.checkboxes.title')}</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="checkbox1"
                    checked={checkboxState}
                    onCheckedChange={(checked) => setCheckboxState(checked === true)}
                  />
                  <Label htmlFor="checkbox1">{t('forms.checkboxes.acceptTerms')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="checkbox2" />
                  <Label htmlFor="checkbox2">{t('forms.checkboxes.promotional')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="checkbox3" disabled />
                  <Label htmlFor="checkbox3">{t('forms.checkboxes.disabled')}</Label>
                </div>
              </div>

              {/* Radio Group */}
              <div className="space-y-3">
                <Label>{t('forms.radioGroup.title')}</Label>
                <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="option1" />
                    <Label htmlFor="option1">{t('forms.radioGroup.option1')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="option2" />
                    <Label htmlFor="option2">{t('forms.radioGroup.option2')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option3" id="option3" />
                    <Label htmlFor="option3">{t('forms.radioGroup.option3')}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Switch */}
              <div className="space-y-3">
                <Label>{t('forms.switches.title')}</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="switch1"
                    checked={switchState}
                    onCheckedChange={setSwitchState}
                  />
                  <Label htmlFor="switch1">{t('forms.switches.notifications')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="switch2" />
                  <Label htmlFor="switch2">{t('forms.switches.darkMode')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="switch3" disabled />
                  <Label htmlFor="switch3">{t('forms.switches.disabled')}</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('alerts.title')}</CardTitle>
              <CardDescription>{t('alerts.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>{t('alerts.defaultAlert')}</AlertTitle>
                <AlertDescription>
                  {t('alerts.defaultDescription')}
                </AlertDescription>
              </Alert>

              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">{t('alerts.success')}</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {t('alerts.successDescription')}
                </AlertDescription>
              </Alert>

              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-200">{t('alerts.warning')}</AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  {t('alerts.warningDescription')}
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('alerts.error')}</AlertTitle>
                <AlertDescription>
                  {t('alerts.errorDescription')}
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">{t('alerts.information')}</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  {t('alerts.informationDescription')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('progress.title')}</CardTitle>
              <CardDescription>{t('progress.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('progress.progressBar')} ({progressValue}%)</Label>
                <Progress value={progressValue} className="w-full" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>
                    {t('progress.decrease')}
                  </Button>
                  <Button size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
                    {t('progress.increase')}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('progress.differentValues')}</Label>
                <Progress value={0} className="w-full" />
                <Progress value={25} className="w-full" />
                <Progress value={50} className="w-full" />
                <Progress value={75} className="w-full" />
                <Progress value={100} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('toasts.title')}</CardTitle>
              <CardDescription>{t('toasts.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => toast.success({ title: t('toasts.successMessage') })}>
                  {t('toasts.showSuccess')}
                </Button>
                <Button variant="secondary" onClick={() => toast.info({ title: t('toasts.infoMessage') })}>
                  {t('toasts.showInfo')}
                </Button>
                <Button variant="outline" onClick={() => toast.warning({ title: t('toasts.warningMessage') })}>
                  {t('toasts.showWarning')}
                </Button>
                <Button variant="destructive" onClick={() => toast.error({ title: t('toasts.errorMessage') })}>
                  {t('toasts.showError')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('avatars.title')}</CardTitle>
              <CardDescription>{t('avatars.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                
                <Avatar>
                  <AvatarImage src="/broken-image.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>

                <Avatar>
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>

                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('skeleton.title')}</CardTitle>
              <CardDescription>{t('skeleton.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>

              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-32 w-full rounded-lg" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dialogs.title')}</CardTitle>
              <CardDescription>{t('dialogs.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>{t('dialogs.openDialog')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('dialogs.confirmTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('dialogs.confirmDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {t('dialogs.cancel')}
                    </Button>
                    <Button onClick={() => {
                      setDialogOpen(false);
                      toast.success({ title: t('dialogs.actionConfirmed') });
                    }}>
                      {t('dialogs.confirm')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('cards.title')}</CardTitle>
              <CardDescription>{t('cards.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('cards.basicCard')}</CardTitle>
                    <CardDescription>{t('cards.basicDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('cards.basicContent')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('cards.withFooter')}</CardTitle>
                    <CardDescription>{t('cards.footerDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('cards.footerContent')}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">{t('dialogs.cancel')}</Button>
                    <Button>{t('buttons.actions.save')}</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {t('cards.withIcon')}
                      </div>
                    </CardTitle>
                    <CardDescription>{t('cards.iconDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Badge>{t('badges.statuses.active')}</Badge>
                      <span className="text-sm">{t('badges.statuses.statusIndicator')}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle>{t('cards.highlighted')}</CardTitle>
                    <CardDescription>{t('cards.highlightedDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('cards.highlightedContent')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.title')}</CardTitle>
              <CardDescription>{t('tabs.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tab1">{t('tabs.tab1')}</TabsTrigger>
                  <TabsTrigger value="tab2">{t('tabs.tab2')}</TabsTrigger>
                  <TabsTrigger value="tab3">{t('tabs.tab3')}</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('tabs.tab1Content')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{t('tabs.content1')}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('tabs.tab2Content')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{t('tabs.content2')}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab3">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('tabs.tab3Content')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{t('tabs.content3')}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UIShowcase;