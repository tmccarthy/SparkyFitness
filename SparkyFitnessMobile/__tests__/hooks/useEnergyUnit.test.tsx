import { renderHook, waitFor } from '@testing-library/react-native';
import {
  energyForDisplay,
  energyUnitLabel,
  resolveEnergyUnit,
  useEnergyUnit,
} from '../../src/hooks/useEnergyUnit';
import { fetchPreferences } from '../../src/services/api/preferencesApi';
import {
  createQueryWrapper,
  createTestQueryClient,
  type QueryClient,
} from './queryTestUtils';

jest.mock('../../src/services/api/preferencesApi', () => ({
  fetchPreferences: jest.fn(),
}));

jest.mock('../../src/services/LogService', () => ({
  addLog: jest.fn(),
}));

const mockFetchPreferences = fetchPreferences as jest.MockedFunction<
  typeof fetchPreferences
>;

const t = ((key: string, options?: { defaultValue?: string }) =>
  options?.defaultValue ?? key) as Parameters<typeof energyUnitLabel>[0];

describe('energy unit helpers', () => {
  test('resolveEnergyUnit falls back to kcal for anything but kJ', () => {
    expect(resolveEnergyUnit('kJ')).toBe('kJ');
    expect(resolveEnergyUnit('kcal')).toBe('kcal');
    expect(resolveEnergyUnit(undefined)).toBe('kcal');
    expect(resolveEnergyUnit(null)).toBe('kcal');
    expect(resolveEnergyUnit('calories')).toBe('kcal');
  });

  test('energyForDisplay leaves kcal alone and converts kJ at 4.184 per kcal', () => {
    expect(energyForDisplay(2000, 'kcal')).toBe(2000);
    expect(energyForDisplay(2000, 'kJ')).toBe(8368);
    expect(energyForDisplay(123.4, 'kcal')).toBe(123);
    expect(energyForDisplay(123.4, 'kJ')).toBe(516);
  });

  test('energyUnitLabel keeps the surface wording for kcal and says kJ otherwise', () => {
    expect(energyUnitLabel(t, 'kcal')).toBe('kcal');
    expect(energyUnitLabel(t, 'kcal', 'Cal')).toBe('Cal');
    expect(energyUnitLabel(t, 'kJ')).toBe('kJ');
    expect(energyUnitLabel(t, 'kJ', 'Cal')).toBe('kJ');
  });
});

describe('useEnergyUnit', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  test('reports kcal until preferences load, then the stored energy unit', async () => {
    mockFetchPreferences.mockResolvedValue({ energy_unit: 'kJ' });

    const { result } = renderHook(() => useEnergyUnit(), {
      wrapper: createQueryWrapper(queryClient),
    });

    expect(result.current.energyUnit).toBe('kcal');
    expect(result.current.toDisplay(500)).toBe(500);

    await waitFor(() => {
      expect(result.current.energyUnit).toBe('kJ');
    });
    expect(result.current.convert(500)).toBeCloseTo(2092, 0);
    expect(result.current.toDisplay(500)).toBe(2092);
    expect(result.current.unitLabel()).toBe('kJ');
    expect(result.current.unitLabel('Cal')).toBe('kJ');
  });

  test('stays in kcal and keeps the caller wording when the preference is kcal', async () => {
    mockFetchPreferences.mockResolvedValue({ energy_unit: 'kcal' });

    const { result } = renderHook(() => useEnergyUnit(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockFetchPreferences).toHaveBeenCalled();
    });
    expect(result.current.energyUnit).toBe('kcal');
    expect(result.current.toDisplay(500)).toBe(500);
    expect(result.current.unitLabel('Cal')).toBe('Cal');
    expect(result.current.unitLabel()).toBe('kcal');
  });
});
