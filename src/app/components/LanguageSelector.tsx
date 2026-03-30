import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇹🇳' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-gray-600" />
      <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
        <SelectTrigger className="w-32 border-none bg-transparent text-sm font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
