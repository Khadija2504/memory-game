import { TestBed } from '@angular/core/testing';

import { GameService, PALETTE } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with 4 pads and adds one every 2 levels, capped at the palette', () => {
    expect(service.padsForLevel(1).length).toBe(4);
    expect(service.padsForLevel(2).length).toBe(4);
    expect(service.padsForLevel(3).length).toBe(5);
    expect(service.padsForLevel(99).length).toBe(PALETTE.length);
  });

  it('extends the sequence by one valid pad without mutating the original', () => {
    const original = [0, 1];
    const next = service.extendSequence(original, 4);
    expect(original.length).toBe(2);
    expect(next.length).toBe(3);
    expect(next[2]).toBeGreaterThanOrEqual(0);
    expect(next[2]).toBeLessThan(4);
  });

  it('checks partial and complete input', () => {
    expect(service.isCorrectSoFar([1, 2, 3], [1, 2])).toBeTrue();
    expect(service.isCorrectSoFar([1, 2, 3], [1, 3])).toBeFalse();
    expect(service.isSequenceCorrect([1, 2, 3], [1, 2])).toBeFalse();
    expect(service.isSequenceCorrect([1, 2, 3], [1, 2, 3])).toBeTrue();
  });
});
