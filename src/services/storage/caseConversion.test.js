import { describe, it, expect } from 'vitest';
import { toSnakeCase, toCamelCase } from './caseConversion';

describe('toSnakeCase', () => {
  it('converts a camelCase key to snake_case', () => {
    expect(toSnakeCase('trimLevel')).toBe('trim_level');
    expect(toSnakeCase('garageVehicles')).toBe('garage_vehicles');
  });

  it('leaves an already-lowercase key unchanged', () => {
    expect(toSnakeCase('id')).toBe('id');
    expect(toSnakeCase('name')).toBe('name');
  });
});

describe('toCamelCase', () => {
  it('converts a snake_case key to camelCase', () => {
    expect(toCamelCase('trim_level')).toBe('trimLevel');
    expect(toCamelCase('garage_vehicles')).toBe('garageVehicles');
  });

  it('leaves a key with no underscores unchanged', () => {
    expect(toCamelCase('id')).toBe('id');
    expect(toCamelCase('name')).toBe('name');
  });
});

describe('toSnakeCase / toCamelCase round-tripping', () => {
  const camelKeys = [
    'id',
    'userId',
    'trimLevel',
    'garageVehicles',
    'oweItems',
    'monthsLeft',
    'completedDate',
    'recurringDay',
  ];

  it.each(camelKeys)('round-trips %s through snake_case and back', (key) => {
    expect(toCamelCase(toSnakeCase(key))).toBe(key);
  });
});
