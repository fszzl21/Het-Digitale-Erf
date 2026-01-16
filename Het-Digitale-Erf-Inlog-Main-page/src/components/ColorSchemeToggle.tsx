import { Palette } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export type ColorScheme = 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'high-contrast';

interface ColorSchemeToggleProps {
  onSchemeChange?: (scheme: ColorScheme) => void;
}

const colorSchemes = {
  default: {
    label: 'Standaard',
    description: 'Normale kleuren',
  },
  protanopia: {
    label: 'Protanopie',
    description: 'Rood-groen kleurenblind (rood)',
  },
  deuteranopia: {
    label: 'Deuteranopie',
    description: 'Rood-groen kleurenblind (groen)',
  },
  tritanopia: {
    label: 'Tritanopie',
    description: 'Blauw-geel kleurenblind',
  },
  'high-contrast': {
    label: 'Hoog Contrast',
    description: 'Extra contrast voor lage visie',
  },
};

export function ColorSchemeToggle({ onSchemeChange }: ColorSchemeToggleProps) {
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>('default');

  // Laad opgeslagen kleurenschema bij opstarten
  useEffect(() => {
    const savedScheme = localStorage.getItem('colorScheme') as ColorScheme;
    if (savedScheme && colorSchemes[savedScheme]) {
      applyColorScheme(savedScheme);
    }
  }, []);

  const applyColorScheme = (scheme: ColorScheme) => {
    // Verwijder alle bestaande kleurenschema classes
    document.documentElement.classList.remove(
      'scheme-protanopia',
      'scheme-deuteranopia',
      'scheme-tritanopia',
      'scheme-high-contrast'
    );

    // Voeg nieuwe class toe (behalve voor default)
    if (scheme !== 'default') {
      document.documentElement.classList.add(`scheme-${scheme}`);
    }

    // Sla op in localStorage
    localStorage.setItem('colorScheme', scheme);
    setCurrentScheme(scheme);

    // Callback voor parent component
    onSchemeChange?.(scheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Kleurenschema voor toegankelijkheid"
        >
          <Palette className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Kleurenschema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(colorSchemes).map(([key, { label, description }]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => applyColorScheme(key as ColorScheme)}
            className="flex flex-col items-start cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className={`w-2 h-2 rounded-full ${
                  currentScheme === key ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
              <span>{label}</span>
            </div>
            <span className="text-xs text-gray-500 ml-4">{description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
