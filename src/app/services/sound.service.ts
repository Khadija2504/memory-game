import { Injectable } from '@angular/core';

const MUTE_KEY = 'memory-game.muted';

/** Tiny Web Audio synth: one note per pad, plus success / error cues. */
@Injectable({
  providedIn: 'root',
})
export class SoundService {
  muted = this.readMuted();

  private ctx?: AudioContext;
  // C major pentatonic-ish scale so any sequence sounds pleasant.
  private readonly notes = [261.63, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

  pad(index: number, durationMs = 300): void {
    this.tone(this.notes[index % this.notes.length], durationMs / 1000, 'triangle');
  }

  success(): void {
    [659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.16, 'sine', i * 0.08));
  }

  error(): void {
    this.tone(155, 0.45, 'sawtooth', 0, 0.08);
    this.tone(110, 0.55, 'sawtooth', 0.12, 0.08);
  }

  toggle(): void {
    this.muted = !this.muted;
    try {
      localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType, delay = 0, peak = 0.16): void {
    if (this.muted) return;
    const ctx = this.context();
    if (!ctx) return;

    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private context(): AudioContext | undefined {
    try {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return undefined;
      this.ctx ??= new Ctor();
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    } catch {
      return undefined;
    }
  }

  private readMuted(): boolean {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
