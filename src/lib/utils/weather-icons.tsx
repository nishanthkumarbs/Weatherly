import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudDrizzle,
  Wind,
} from 'lucide-react';

interface IconProps {
  code?: string;
  condition?: string;
  isDay?: boolean;
  className?: string;
}

export function WeatherIcon({ code, condition = '', isDay = true, className = 'w-6 h-6' }: IconProps) {
  const cond = condition.toLowerCase();

  // Code based mapping (e.g. 01d, 10n)
  if (code) {
    if (code.startsWith('01')) {
      return isDay ? (
        <Sun className={`${className} text-amber-400 animate-spin-slow`} />
      ) : (
        <Moon className={`${className} text-indigo-300`} />
      );
    }
    if (code.startsWith('02')) {
      return isDay ? (
        <CloudSun className={`${className} text-amber-300`} />
      ) : (
        <CloudMoon className={`${className} text-indigo-200`} />
      );
    }
    if (code.startsWith('03') || code.startsWith('04')) {
      return <Cloud className={`${className} text-slate-300`} />;
    }
    if (code.startsWith('09') || code.startsWith('10')) {
      return <CloudRain className={`${className} text-sky-400`} />;
    }
    if (code.startsWith('11')) {
      return <CloudLightning className={`${className} text-amber-400`} />;
    }
    if (code.startsWith('13')) {
      return <CloudSnow className={`${className} text-blue-200`} />;
    }
    if (code.startsWith('50')) {
      return <CloudFog className={`${className} text-slate-400`} />;
    }
  }

  // Fallback condition string mapping
  if (cond.includes('thunder') || cond.includes('lightning')) {
    return <CloudLightning className={`${className} text-amber-400`} />;
  }
  if (cond.includes('rain') || cond.includes('shower')) {
    return <CloudRain className={`${className} text-sky-400`} />;
  }
  if (cond.includes('drizzle')) {
    return <CloudDrizzle className={`${className} text-sky-300`} />;
  }
  if (cond.includes('snow') || cond.includes('flurry') || cond.includes('blizzard')) {
    return <CloudSnow className={`${className} text-blue-200`} />;
  }
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
    return <CloudFog className={`${className} text-slate-400`} />;
  }
  if (cond.includes('wind')) {
    return <Wind className={`${className} text-teal-300`} />;
  }
  if (cond.includes('cloud') || cond.includes('overcast')) {
    return isDay ? (
      <CloudSun className={`${className} text-sky-200`} />
    ) : (
      <CloudMoon className={`${className} text-indigo-200`} />
    );
  }

  // Clear / Sun
  return isDay ? (
    <Sun className={`${className} text-amber-400`} />
  ) : (
    <Moon className={`${className} text-indigo-300`} />
  );
}
