
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { Language } from '@/types';

const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: t('languages.en') },
    { code: 'hi', label: t('languages.hi') },
    { code: 'bn', label: t('languages.bn') },
    { code: 'es', label: t('languages.es') },
    { code: 'pt', label: t('languages.pt') },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="h-5 w-5" />
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-inventory-accent text-white text-[8px] flex items-center justify-center">
            {language.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? "bg-inventory-light font-semibold" : ""}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
