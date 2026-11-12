import { Component, HostListener, OnDestroy } from '@angular/core';
import { GameService, MAX_LIVES, PadColor } from '../services/game.service';
import { SoundService } from '../services/sound.service';

/**
 * menu    → start screen
 * showing → the board plays the sequence
 * input   → the player repeats it
 * success → round cleared, next round about to start
 * miss    → player lost a life, same sequence replays
 * over    → no lives left
 */
export type Phase = 'menu' | 'showing' | 'input' | 'success' | 'miss' | 'over';

@Component({
  selector: 'app-game',
  standalone: false,
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent implements OnDestroy {
  readonly maxLives = MAX_LIVES;

  phase: Phase = 'menu';
  pads: PadColor[] = [];
  sequence: number[] = [];
  input: number[] = [];

  level = 1;
  score = 0;
  lives = MAX_LIVES;
  best: number;
  newBest = false;
  lastGain = 0;

  timeLeft = 0;
  timeTotal = 0;
  timedOut = false;

  activePad: number | null = null; // currently lit
  wrongPad: number | null = null; // the pad the player got wrong
  hintPad: number | null = null; // the pad they should have pressed
  freshPad: number | null = null; // pad unlocked this round

  /** Menu preview: 9 pads lighting up in this order. */
  readonly previewPads: PadColor[];
  readonly previewOrder = [0, 4, 2, 7, 1, 5, 8, 3, 6];

  readonly steps = [
    { title: 'Watch', text: 'The board lights up a sequence of colours, one at a time.' },
    { title: 'Repeat', text: 'Tap the pads (or press keys 1–0) in the same order before time runs out.' },
    { title: 'Survive', text: 'You have 3 lives. A mistake costs one and the sequence replays.' },
  ];

  private runId = 0;
  private timeouts = new Set<ReturnType<typeof setTimeout>>();
  private tick: ReturnType<typeof setInterval> | null = null;
  private deadline = 0;

  constructor(private game: GameService, public sound: SoundService) {
    this.best = game.loadBest();
    this.previewPads = game.palette.slice(0, 9);
  }

  get columns(): number {
    const n = this.pads.length;
    if (n <= 4) return 2;
    if (n <= 6 || n === 9) return 3;
    if (n <= 8) return 4;
    return 5;
  }

  get playing(): boolean {
    return this.phase !== 'menu';
  }

  get statusText(): string {
    switch (this.phase) {
      case 'showing':
        return this.freshPad !== null ? 'New colour unlocked!' : 'Watch closely…';
      case 'input':
        return 'Your turn';
      case 'success':
        return `Perfect! +${this.lastGain}`;
      case 'miss': {
        const left = `${this.lives} ${this.lives === 1 ? 'life' : 'lives'} left`;
        return this.timedOut ? `Time's up · ${left}` : `Wrong pad · ${left}`;
      }
      case 'over':
        return 'Out of lives';
      default:
        return '';
    }
  }

  keyLabel(i: number): string {
    return i === 9 ? '0' : String(i + 1);
  }

  startGame(): void {
    this.reset();
    this.level = 1;
    this.score = 0;
    this.lives = MAX_LIVES;
    this.sequence = [];
    this.pads = [];
    this.newBest = false;
    this.timedOut = false;
    this.nextRound();
  }

  backToMenu(): void {
    this.reset();
    this.phase = 'menu';
  }

  press(i: number): void {
    if (this.phase !== 'input') return;

    const expected = this.sequence[this.input.length];
    if (i !== expected) {
      this.loseLife(i, expected);
      return;
    }

    this.input = [...this.input, i];
    this.light(i, 220);
    if (this.input.length === this.sequence.length) {
      this.roundWon();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (this.phase !== 'input' || !/^[0-9]$/.test(event.key)) return;
    const i = event.key === '0' ? 9 : Number(event.key) - 1;
    if (i < this.pads.length) this.press(i);
  }

  ngOnDestroy(): void {
    this.reset();
  }

  // ---- round flow --------------------------------------------------------

  /** Adds a step (and maybe a colour), then plays the sequence. */
  private nextRound(): void {
    const prevCount = this.pads.length;
    this.pads = this.game.padsForLevel(this.level);
    this.freshPad = prevCount > 0 && this.pads.length > prevCount ? this.pads.length - 1 : null;
    this.sequence = this.game.extendSequence(this.sequence, this.pads.length);
    this.playSequence(this.freshPad !== null ? 1200 : 700);
  }

  /** Plays the current sequence, then hands control to the player. */
  private async playSequence(leadIn: number): Promise<void> {
    const run = this.runId;
    this.input = [];
    this.timeLeft = this.timeTotal = this.game.timeForRound(this.sequence.length);
    this.phase = 'showing';

    await this.wait(leadIn);
    if (run !== this.runId) return;

    const on = this.game.flashDuration(this.level);
    for (const pad of this.sequence) {
      this.light(pad, on);
      await this.wait(on + 160);
      if (run !== this.runId) return;
    }

    this.freshPad = null;
    this.phase = 'input';
    this.startTimer(this.timeTotal);
  }

  private roundWon(): void {
    this.stopTimer();
    this.lastGain = this.game.roundScore(this.sequence.length, this.timeLeft);
    this.score += this.lastGain;
    this.phase = 'success';
    this.later(() => this.sound.success(), 180);
    this.later(() => {
      this.level++;
      this.nextRound();
    }, 1000);
  }

  /** Wrong pad (or time out): lose a life and replay, or end the game. */
  private loseLife(wrong: number | null, expected: number | null): void {
    this.stopTimer();
    this.activePad = null;
    this.wrongPad = wrong;
    this.hintPad = expected;
    this.timedOut = wrong === null;
    this.lives = Math.max(0, this.lives - 1);
    this.sound.error();

    if (this.lives === 0) {
      this.finish();
      return;
    }

    this.phase = 'miss';
    this.later(() => {
      this.wrongPad = this.hintPad = null;
      this.playSequence(400);
    }, 1800);
  }

  private finish(): void {
    if (this.score > this.best) {
      this.best = this.score;
      this.newBest = true;
      this.game.saveBest(this.score);
    }
    this.phase = 'over';
  }

  // ---- helpers -----------------------------------------------------------

  private light(pad: number, ms: number): void {
    this.activePad = pad;
    this.sound.pad(pad, ms);
    this.later(() => {
      if (this.activePad === pad) this.activePad = null;
    }, ms);
  }

  private startTimer(seconds: number): void {
    this.stopTimer();
    this.timeTotal = this.timeLeft = seconds;
    this.deadline = performance.now() + seconds * 1000;
    this.tick = setInterval(() => {
      this.timeLeft = Math.max(0, (this.deadline - performance.now()) / 1000);
      if (this.timeLeft <= 0) {
        this.loseLife(null, this.sequence[this.input.length] ?? null);
      }
    }, 100);
  }

  private stopTimer(): void {
    if (this.tick) {
      clearInterval(this.tick);
      this.tick = null;
    }
  }

  private later(fn: () => void, ms: number): void {
    const id = setTimeout(() => {
      this.timeouts.delete(id);
      fn();
    }, ms);
    this.timeouts.add(id);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => this.later(resolve, ms));
  }

  /** Cancels every pending timer and any in-flight playback. */
  private reset(): void {
    this.runId++;
    this.timeouts.forEach(clearTimeout);
    this.timeouts.clear();
    this.stopTimer();
    this.activePad = this.wrongPad = this.hintPad = this.freshPad = null;
    this.input = [];
  }
}
