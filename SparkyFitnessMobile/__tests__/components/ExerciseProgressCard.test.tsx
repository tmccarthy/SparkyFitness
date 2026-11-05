import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ExerciseProgressCard from '../../src/components/ExerciseProgressCard';
import { mockEnergyUnitRef } from '../helpers/energyUnitMock';

jest.mock('../../src/hooks/useEnergyUnit', () =>
  require('../helpers/energyUnitMock').energyUnitModuleMock()
);

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: () => true,
}));

const baseProps = {
  exerciseMinutes: 45,
  exerciseMinutesGoal: 30,
  exerciseCalories: 300,
  exerciseCaloriesGoal: 400,
};

describe('ExerciseProgressCard', () => {
  beforeEach(() => {
    mockEnergyUnitRef.current = 'kcal';
  });

  it('shows burned calories against the goal in Cal by default', () => {
    const { getByText } = render(<ExerciseProgressCard {...baseProps} />);
    expect(getByText('300 / 400 Cal')).toBeTruthy();
  });

  it('shows burned energy and the goal in kJ when the energy unit is kJ (#1968)', () => {
    mockEnergyUnitRef.current = 'kJ';
    const { getByText, queryByText } = render(
      <ExerciseProgressCard {...baseProps} />
    );
    // 300 kcal = 1,255 kJ; 400 kcal = 1,674 kJ
    expect(getByText('1255 / 1674 kJ')).toBeTruthy();
    expect(queryByText(/\bCal\b/)).toBeNull();
  });

  it('opens statistics from the card header', () => {
    const onPressDetails = jest.fn();
    const { getByText } = render(
      <ExerciseProgressCard {...baseProps} onPressDetails={onPressDetails} />
    );
    fireEvent.press(getByText('Statistics'));
    expect(onPressDetails).toHaveBeenCalledTimes(1);
  });

  it('shows no statistics link without a handler', () => {
    const { queryByText } = render(<ExerciseProgressCard {...baseProps} />);
    expect(queryByText('Statistics')).toBeNull();
  });
});
