import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  User, 
  Lock,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { PageLayout } from '@/components/common';

const Settings: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
    marketing: false,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    activityVisible: false,
    showEmail: false,
  });

  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  const handleSaveSettings = () => {
    // Mock save functionality
    console.log('Settings saved:', {
      theme,
      notifications,
      privacy,
      language,
      timezone,
    });
    // You could show a toast notification here
  };

  return (
    <PageLayout
      title={t('settings.title')}
      description={t('settings.subtitle')}
      maxWidth="4xl"
      actions={<Badge variant="secondary">{t('settings.mock_badge')}</Badge>}
    >

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('settings.appearance.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.appearance.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">{t('settings.appearance.theme')}</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder={t('settings.appearance.theme_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.appearance.light')}</SelectItem>
                  <SelectItem value="dark">{t('settings.appearance.dark')}</SelectItem>
                  <SelectItem value="system">{t('settings.appearance.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('settings.notifications.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">{t('settings.notifications.email.title')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notifications.email.description')}
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, email: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">{t('settings.notifications.push.title')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notifications.push.description')}
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, push: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="desktop-notifications">{t('settings.notifications.desktop.title')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notifications.desktop.description')}
                </p>
              </div>
              <Switch
                id="desktop-notifications"
                checked={notifications.desktop}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, desktop: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-notifications">{t('settings.notifications.marketing.title')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notifications.marketing.description')}
                </p>
              </div>
              <Switch
                id="marketing-notifications"
                checked={notifications.marketing}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('settings.privacy.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.privacy.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profile-visible">{t('settings.privacy.profile_visibility.title')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.privacy.profile_visibility.description')}
                </p>
              </div>
              <Switch
                id="profile-visible"
                checked={privacy.profileVisible}
                onCheckedChange={(checked) => 
                  setPrivacy(prev => ({ ...prev, profileVisible: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="activity-visible">{t('settings.privacy.activity_status.title')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.privacy.activity_status.description')}
                </p>
              </div>
              <Switch
                id="activity-visible"
                checked={privacy.activityVisible}
                onCheckedChange={(checked) => 
                  setPrivacy(prev => ({ ...prev, activityVisible: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-email">{t('settings.privacy.show_email.title')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.privacy.show_email.description')}
                </p>
              </div>
              <Switch
                id="show-email"
                checked={privacy.showEmail}
                onCheckedChange={(checked) => 
                  setPrivacy(prev => ({ ...prev, showEmail: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('settings.localization.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.localization.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.localization.language')}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.localization.language_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('settings.localization.languages.en')}</SelectItem>
                    <SelectItem value="es">{t('settings.localization.languages.es')}</SelectItem>
                    <SelectItem value="fr">{t('settings.localization.languages.fr')}</SelectItem>
                    <SelectItem value="de">{t('settings.localization.languages.de')}</SelectItem>
                    <SelectItem value="it">{t('settings.localization.languages.it')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t('settings.localization.timezone')}</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.localization.timezone_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">{t('settings.localization.timezones.utc')}</SelectItem>
                    <SelectItem value="EST">{t('settings.localization.timezones.est')}</SelectItem>
                    <SelectItem value="PST">{t('settings.localization.timezones.pst')}</SelectItem>
                    <SelectItem value="GMT">{t('settings.localization.timezones.gmt')}</SelectItem>
                    <SelectItem value="CET">{t('settings.localization.timezones.cet')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('settings.security.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.security.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="mr-2 h-4 w-4" />
                {t('settings.security.change_password')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                {t('settings.security.enable_2fa')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                {t('settings.security.active_sessions')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveSettings} className="min-w-32">
            <Save className="mr-2 h-4 w-4" />
            {t('settings.actions.save_settings')}
          </Button>
        </div>
    </PageLayout>
  );
};

export default Settings;