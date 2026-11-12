import { Injectable } from '@angular/core';

export interface PadColor {
  name: string;
  hex: string;
  shape: string;
}

export const MAX_LIVES = 3;

/** Ordered so the first pads are the most distinct from each other. */
export const PALETTE: PadColor[] = [
  { name: 'Coral', hex: '#ff5d73', shape: 'M12 4a8 8 0 1 1 0 16a8 8 0 1 1 0-16z' },
  { name: 'Sky', hex: '#4cc9ff', shape: 'M12 4l8.5 15h-17z' },
  { name: 'Lime', hex: '#b8f35a', shape: 'M5 5h14v14H5z' },
  { name: 'Amber', hex: '#ffb547', shape: 'M12 3l9 9-9 9-9-9z' },
  { name: 'Violet', hex: '#b06bff', shape: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6l-5.4 2.9 1.2-6-4.5-4.2 6.1-.7z' },
  { name: 'Mint', hex: '#3ee6b0', shape: 'M9 4h6v5h5v6h-5v5H9v-5H4V9h5z' },
  { name: 'Rose', hex: '#ff6bd6', shape: 'M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z' },
  { name: 'Indigo', hex: '#6c7bff', shape: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16zm0 4.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7z' },
  { name: 'Sand', hex: '#e8d6a8', shape: 'M12 3l8.6 6.2-3.3 10.1H6.7L3.4 9.2z' },
  { name: 'Teal', hex: '#1fb5c4', shape: 'M13 2 4 14h7l-1 8 9-12h-7z' },
];

const BEST_KEY = 'memory-game.best';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  readonly palette = PALETTE;

  /** 4 pads to start, one more every 2 levels, capped at the palette size. */
  padsForLevel(level: number): PadColor[] {
    const count = Math.min(PALETTE.length, 4 + Math.floor((level - 1) / 2));
    return PALETTE.slice(0, count);
  }

  /** Returns a new sequence with one random pad index appended. */
  extendSequence(sequence: number[], padCount: number): number[] {
    return [...sequence, Math.floor(Math.random() * padCount)];
  }

  /** True while every pad entered so far matches the sequence. */
  isCorrectSoFar(sequence: number[], input: number[]): boolean {
    return input.length <= sequence.length && input.every((pad, i) => pad === sequence[i]);
  }

  isSequenceCorrect(sequence: number[], input: number[]): boolean {
    return sequence.length === input.length && this.isCorrectSoFar(sequence, input);
  }

  /** Seconds allowed to repeat a sequence of the given length. */
  timeForRound(length: number): number {
    return Math.round(6 + length * 1.2);
  }

  /** How long each pad stays lit during playback — gets faster with level. */
  flashDuration(level: number): number {
    return Math.max(260, 620 - level * 30);
  }

  roundScore(sequenceLength: number, timeLeft: number): number {
    return sequenceLength * 10 + Math.ceil(timeLeft) * 5;
  }

  loadBest(): number {
    try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  saveBest(score: number): void {
    try {
      localStorage.setItem(BEST_KEY, String(score));
    } catch {
      /* storage unavailable — ignore */
    }
  }
}
