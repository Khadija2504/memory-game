import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-score',
  standalone: false,
  templateUrl: './score.component.html',
  styleUrl: './score.component.css',
})
export class ScoreComponent {
  @Input() score = 0;
  @Input() level = 1;
  @Input() best = 0;
  @Input() lives = 3;
  @Input() maxLives = 3;
  @Input() timeLeft = 0;
  @Input() timeTotal = 0;
  @Input() running = false;

  get seconds(): number {
    return Math.ceil(this.timeLeft);
  }

  /** 0–100 for the timer ring's stroke-dashoffset. */
  get remaining(): number {
    return this.timeTotal > 0 ? (this.timeLeft / this.timeTotal) * 100 : 100;
  }

  get low(): boolean {
    return this.running && this.timeLeft <= 3;
  }

  /** One entry per heart: true = still alive. */
  get hearts(): boolean[] {
    return Array.from({ length: this.maxLives }, (_, i) => i < this.lives);
  }
}
