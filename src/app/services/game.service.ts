import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class GameService {
  addColorToSequence(sequence: string[], colors: string[]): string[] {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return [...sequence, randomColor];
  }

  isSequenceCorrect(sequence: string[], userSequence: string[]): boolean {
    return sequence.length === userSequence.length && sequence.every((color, index) => color === userSequence[index]);
  }
}
