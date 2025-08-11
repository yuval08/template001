import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getIsMultiLanguageEnabled, getAvailableLanguages } from '@/i18n';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const isMultiLanguageEnabled = getIsMultiLanguageEnabled();
  const availableLanguages = getAvailableLanguages();

  // Don't render if multi-language is disabled
  if (!isMultiLanguageEnabled) {
    return null;
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const availableLanguageOptions = languages.filter(lang => 
    availableLanguages.includes(lang.code)
  );

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      // Cookie persistence is handled automatically by i18next
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 px-0 md:h-9 md:w-auto md:px-3"
        >
          <Languages className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline-flex">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLanguageOptions.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 ${
              language.code === i18n.language ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {language.code === i18n.language && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;