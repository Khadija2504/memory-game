import { Component } from '@angular/core';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game',
  standalone: false,
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})

export class GameComponent {
  colors = ['red', 'blue', 'green', 'yellow'];
  sequence: string[] = [];
  userSequence: string[] = [];
  level = 1;
  score = 0;
  gameStarted = false;
  canClick = false;
  gameOver = false;

  constructor(private gameService: GameService) {}

  startGame() {
    this.gameStarted = true;
    this.sequence = [];
    this.level = 1;
    this.score = 0;
    this.gameOver = false;
    this.nextLevel();
  }

  nextLevel() {
    this.canClick = false;
    this.userSequence = [];
    this.sequence = this.gameService.addColorToSequence(this.sequence, this.colors);
    this.displaySequence();
  }

  displaySequence() {
    let index = 0;

    const interval = setInterval(() => {
      if (index < this.sequence.length) {
        const color = this.sequence[index];
        this.highlightColor(color);
        index++;
      } else {
        clearInterval(interval);
        this.canClick = true;
      }
    }, 1000);
  }

  highlightColor(color: string) {
    const button = document.querySelector(`[style="background-color: ${color};"]`);
    if (button) {
      button.classList.add('highlight');
      setTimeout(() => button.classList.remove('highlight'), 500);
    }
  }

  selectColor(color: string) {
    this.userSequence.push(color);
  }

  validateSequence() {
    if (this.gameService.isSequenceCorrect(this.sequence, this.userSequence)) {
      this.score += this.level * 10;
      this.level++;
      this.nextLevel();
    } else {
      this.gameOver = true;
      this.gameStarted = false;
    }
  }

  resetSequence() {
    this.userSequence = [];
  }
}
