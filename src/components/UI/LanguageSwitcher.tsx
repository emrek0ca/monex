import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { Button } from './Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './DropdownMenu';
import { cn } from '@/lib/utils';

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

interface LanguageSwitcherProps {
    variant?: 'default' | 'minimal';
    className?: string;
}

export function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
    const { i18n } = useTranslation();

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode);
    };

    if (variant === 'minimal') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-9 w-9 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10",
                            className
                        )}
                    >
                        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                    {languages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                                "justify-between",
                                i18n.language === lang.code && "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-base">{lang.flag}</span>
                                <span>{lang.name}</span>
                            </span>
                            {i18n.language === lang.code && (
                                <Check className="h-4 w-4" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "gap-2 rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5",
                        "text-gray-700 dark:text-gray-300 h-9 px-3",
                        className
                    )}
                >
                    <span className="text-base">{currentLang.flag}</span>
                    <span className="hidden sm:inline text-sm font-medium">{currentLang.name}</span>
                    <Globe className="h-4 w-4 sm:hidden" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={cn(
                            "justify-between",
                            i18n.language === lang.code && "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.name}</span>
                        </span>
                        {i18n.language === lang.code && (
                            <Check className="h-4 w-4" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
