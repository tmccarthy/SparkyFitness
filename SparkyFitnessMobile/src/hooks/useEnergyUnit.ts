import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { convertEnergyValue } from '@workspace/shared';
import { usePreferences } from './usePreferences';

export type EnergyUnit = 'kcal' | 'kJ';

type Translate = ReturnType<typeof useTranslation>['t'];

/** The stored `energy_unit` preference, falling back to kcal until it loads. */
export function resolveEnergyUnit(unit: string | null | undefined): EnergyUnit {
  return unit === 'kJ' ? 'kJ' : 'kcal';
}

/**
 * Converts a stored kcal figure into the display unit and rounds it to a whole
 * number. The server, the diary snapshots and every food record stay in kcal;
 * only what the person reads changes.
 */
export function energyForDisplay(kcal: number, unit: EnergyUnit): number {
  return Math.round(convertEnergyValue(kcal, 'kcal', unit));
}

/**
 * The unit label printed beside a converted figure. Surfaces that already say
 * "Cal" or "cal" for kcal pass that wording as `kcalLabel` so nothing changes
 * for kcal users; every surface says "kJ" for kilojoules.
 */
export function energyUnitLabel(
  t: Translate,
  unit: EnergyUnit,
  kcalLabel?: string
): string {
  if (unit === 'kJ') {
    return t('energy.kilojoulesShort', { defaultValue: 'kJ' });
  }
  return kcalLabel ?? t('energy.kilocaloriesShort', { defaultValue: 'kcal' });
}

interface UseEnergyUnitOptions {
  enabled?: boolean;
}

/**
 * The person's energy unit (Settings > Profile on the web) with the helpers a
 * display surface needs: `convert` turns a kcal value into the display unit,
 * `toDisplay` does the same and rounds, and `unitLabel` gives the unit text.
 */
export function useEnergyUnit(options: UseEnergyUnitOptions = {}) {
  const { t } = useTranslation();
  const { preferences } = usePreferences(options);
  const energyUnit = resolveEnergyUnit(preferences?.energy_unit);

  const convert = useCallback(
    (kcal: number) => convertEnergyValue(kcal, 'kcal', energyUnit),
    [energyUnit]
  );
  const toDisplay = useCallback(
    (kcal: number) => energyForDisplay(kcal, energyUnit),
    [energyUnit]
  );
  const unitLabel = useCallback(
    (kcalLabel?: string) => energyUnitLabel(t, energyUnit, kcalLabel),
    [t, energyUnit]
  );

  return { energyUnit, convert, toDisplay, unitLabel };
}
