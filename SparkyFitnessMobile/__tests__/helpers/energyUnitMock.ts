import type { EnergyUnit } from '../../src/hooks/useEnergyUnit';

/**
 * The energy unit the mocked `useEnergyUnit` reports. Tests flip it to `'kJ'`
 * to check a surface converts and relabels; it resets to kcal in `beforeEach`
 * of any test that changes it.
 */
export const mockEnergyUnitRef: { current: EnergyUnit } = { current: 'kcal' };

/**
 * A `jest.mock` factory for `src/hooks/useEnergyUnit` that keeps the real pure
 * helpers (and so the real 4.184 conversion) but replaces the hook, so a
 * presentational component renders without a QueryClient or preferences fetch:
 *
 * ```ts
 * jest.mock('../../src/hooks/useEnergyUnit', () =>
 *   require('../helpers/energyUnitMock').energyUnitModuleMock()
 * );
 * ```
 */
export function energyUnitModuleMock() {
  const actual = jest.requireActual<
    typeof import('../../src/hooks/useEnergyUnit')
  >('../../src/hooks/useEnergyUnit');
  const { convertEnergyValue } =
    jest.requireActual<typeof import('@workspace/shared')>('@workspace/shared');
  const t = (key: string, options?: { defaultValue?: string }) =>
    options?.defaultValue ?? key;

  return {
    ...actual,
    useEnergyUnit: () => {
      const energyUnit = mockEnergyUnitRef.current;
      return {
        energyUnit,
        convert: (kcal: number) => convertEnergyValue(kcal, 'kcal', energyUnit),
        toDisplay: (kcal: number) => actual.energyForDisplay(kcal, energyUnit),
        unitLabel: (kcalLabel?: string) =>
          actual.energyUnitLabel(
            t as Parameters<typeof actual.energyUnitLabel>[0],
            energyUnit,
            kcalLabel
          ),
      };
    },
  };
}
