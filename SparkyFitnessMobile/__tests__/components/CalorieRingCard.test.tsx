import React from 'react';
import { render } from '@testing-library/react-native';
import CalorieRingCard from '../../src/components/CalorieRingCard';
import { mockEnergyUnitRef } from '../helpers/energyUnitMock';

jest.mock('../../src/hooks/useEnergyUnit', () =>
  require('../helpers/energyUnitMock').energyUnitModuleMock()
);

jest.mock('../../src/components/ProgressRing', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => <View testID="progress-ring" />,
  };
});

const baseProps = {
  caloriesConsumed: 1200,
  caloriesBurned: 300,
  calorieGoal: 2000,
  remainingCalories: 1100,
  progressPercent: 0.6,
};

describe('CalorieRingCard', () => {
  beforeEach(() => {
    mockEnergyUnitRef.current = 'kcal';
  });

  it('shows consumed, burned, remaining and the goal in kcal by default', () => {
    const { getByText } = render(<CalorieRingCard {...baseProps} />);

    expect(getByText('1,200')).toBeTruthy();
    expect(getByText('300')).toBeTruthy();
    expect(getByText('1,100')).toBeTruthy();
    expect(getByText('of 2,000 kcal')).toBeTruthy();
  });

  it('converts every figure to kilojoules when the energy unit is kJ (#1968)', () => {
    mockEnergyUnitRef.current = 'kJ';
    const { getByText, queryByText } = render(
      <CalorieRingCard {...baseProps} />
    );

    // 1,200 kcal = 5,021 kJ; 300 kcal = 1,255 kJ; 1,100 kcal = 4,602 kJ;
    // 2,000 kcal = 8,368 kJ
    expect(getByText('5,021')).toBeTruthy();
    expect(getByText('1,255')).toBeTruthy();
    expect(getByText('4,602')).toBeTruthy();
    expect(getByText('of 8,368 kJ')).toBeTruthy();
    expect(queryByText(/kcal/)).toBeNull();
  });
});
