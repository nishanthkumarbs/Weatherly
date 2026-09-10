'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TemperatureUnit, SpeedUnit, PrecipUnit, PressureUnit } from '@/lib/types/weather';

interface UnitsContextType {
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  precipUnit: PrecipUnit;
  pressureUnit: PressureUnit;
  setTempUnit: (u: TemperatureUnit) => void;
  setSpeedUnit: (u: SpeedUnit) => void;
  setPrecipUnit: (u: PrecipUnit) => void;
  setPressureUnit: (u: PressureUnit) => void;
  toggleTempUnit: () => void;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [tempUnit, setTempUnitState] = useState<TemperatureUnit>('celsius');
  const [speedUnit, setSpeedUnitState] = useState<SpeedUnit>('kmh');
  const [precipUnit, setPrecipUnitState] = useState<PrecipUnit>('mm');
  const [pressureUnit, setPressureUnitState] = useState<PressureUnit>('hPa');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTemp = localStorage.getItem('weatherly_temp_unit') as TemperatureUnit;
      if (savedTemp && (savedTemp === 'celsius' || savedTemp === 'fahrenheit')) {
        setTempUnitState(savedTemp);
      }
      const savedSpeed = localStorage.getItem('weatherly_speed_unit') as SpeedUnit;
      if (savedSpeed) setSpeedUnitState(savedSpeed);
      const savedPrecip = localStorage.getItem('weatherly_precip_unit') as PrecipUnit;
      if (savedPrecip) setPrecipUnitState(savedPrecip);
      const savedPressure = localStorage.getItem('weatherly_pressure_unit') as PressureUnit;
      if (savedPressure) setPressureUnitState(savedPressure);
    } catch {
      // LocalStorage not available
    }
  }, []);

  const setTempUnit = (u: TemperatureUnit) => {
    setTempUnitState(u);
    try {
      localStorage.setItem('weatherly_temp_unit', u);
      if (u === 'fahrenheit') {
        setSpeedUnitState('mph');
        setPrecipUnitState('inch');
        setPressureUnitState('inHg');
      } else {
        setSpeedUnitState('kmh');
        setPrecipUnitState('mm');
        setPressureUnitState('hPa');
      }
    } catch {}
  };

  const setSpeedUnit = (u: SpeedUnit) => {
    setSpeedUnitState(u);
    try { localStorage.setItem('weatherly_speed_unit', u); } catch {}
  };

  const setPrecipUnit = (u: PrecipUnit) => {
    setPrecipUnitState(u);
    try { localStorage.setItem('weatherly_precip_unit', u); } catch {}
  };

  const setPressureUnit = (u: PressureUnit) => {
    setPressureUnitState(u);
    try { localStorage.setItem('weatherly_pressure_unit', u); } catch {}
  };

  const toggleTempUnit = () => {
    setTempUnit(tempUnit === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  return (
    <UnitsContext.Provider
      value={{
        tempUnit,
        speedUnit,
        precipUnit,
        pressureUnit,
        setTempUnit,
        setSpeedUnit,
        setPrecipUnit,
        setPressureUnit,
        toggleTempUnit,
      }}
    >
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error('useUnits must be used within a UnitsProvider');
  return ctx;
}
