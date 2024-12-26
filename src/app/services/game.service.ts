import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private sequence: string[] = [];
  private colors: string[] = ['red', 'blue', 'green', 'yellow'];
  private userSequence: string[] = [];
  private level: number = 0;

  constructor() {}

  startGame(): void {
    this.sequence = [];
    this.userSequence = [];
    this.level = 0;
    this.addColor();
  }

  addColor(): void {
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.sequence.push(randomColor);
    this.level++;
  }

  getSequence(): string[] {
    return [...this.sequence];
  }

  addUserInput(color: string): void {
    this.userSequence.push(color);
  }

  validateSequence(): boolean {
    return this.userSequence.join() === this.sequence.join();
  }

  resetUserSequence(): void {
    this.userSequence = [];
  }

  getLevel(): number {
    return this.level;
  }
}
