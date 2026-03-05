import { describe, it, expect } from 'vitest';
import { tools } from './tools';

describe('tools', () => {
  it('should define exactly 6 tools', () => {
    expect(tools).toHaveLength(6);
  });

  it('should have unique tool names', () => {
    const names = tools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  const expectedTools = [
    { name: 'create_routine', required: ['name', 'schedule'] },
    { name: 'update_routine', required: ['routineId'] },
    { name: 'delete_routine', required: ['routineId'] },
    { name: 'add_exercise', required: ['routineId', 'name', 'sets'] },
    { name: 'update_exercise', required: ['exerciseId'] },
    { name: 'delete_exercise', required: ['exerciseId'] },
  ];

  for (const expected of expectedTools) {
    describe(expected.name, () => {
      it('should exist with correct name', () => {
        const tool = tools.find((t) => t.name === expected.name);
        expect(tool).toBeDefined();
      });

      it('should have a description', () => {
        const tool = tools.find((t) => t.name === expected.name)!;
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(10);
      });

      it(`should have required fields: ${expected.required.join(', ')}`, () => {
        const tool = tools.find((t) => t.name === expected.name)!;
        const schema = tool.input_schema as { required?: string[] };
        expect(schema.required).toEqual(expect.arrayContaining(expected.required));
      });

      it('should have an object-type input_schema', () => {
        const tool = tools.find((t) => t.name === expected.name)!;
        expect(tool.input_schema.type).toBe('object');
      });
    });
  }

  describe('add_exercise schema', () => {
    it('should define unit as enum with lbs, kg', () => {
      const tool = tools.find((t) => t.name === 'add_exercise')!;
      const props = (tool.input_schema as { properties: Record<string, { enum?: string[] }> }).properties;
      expect(props.unit.enum).toEqual(['lbs', 'kg']);
    });

    it('should define exerciseType as enum', () => {
      const tool = tools.find((t) => t.name === 'add_exercise')!;
      const props = (tool.input_schema as { properties: Record<string, { enum?: string[] }> }).properties;
      expect(props.exerciseType.enum).toContain('weight_reps');
      expect(props.exerciseType.enum).toContain('duration');
      expect(props.exerciseType.enum).toContain('band_reps');
    });

    it('should have videoUrl property', () => {
      const tool = tools.find((t) => t.name === 'add_exercise')!;
      const props = (tool.input_schema as { properties: Record<string, unknown> }).properties;
      expect(props.videoUrl).toBeDefined();
    });
  });

  describe('create_routine schema', () => {
    it('should define schedule as array of numbers', () => {
      const tool = tools.find((t) => t.name === 'create_routine')!;
      const props = (tool.input_schema as { properties: Record<string, { type: string; items?: { type: string } }> }).properties;
      expect(props.schedule.type).toBe('array');
      expect(props.schedule.items?.type).toBe('number');
    });
  });
});
