import { Component } from '@angular/core';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game',
  standalone: false,
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  colors = ['red'];
  sequence: string[] = [];
  userSequence: string[] = [];
  level = 1;
  score = 0;
  gameStarted = false;
  canClick = false;
  gameOver = false;
  selectedColor: string | null = null;
  additionalColors = ['purple', 'blue', 'cyan', 'pink', 'lime', 'brown', 'green', 'yellow', 'orange'];
  timer = 15;
  timerInterval: any;

  constructor(private gameService: GameService) {}

  startGame() {
    this.gameStarted = true;
    this.sequence = [];
    this.level = 1;
    this.score = 0;
    this.gameOver = false;
    this.timer = 15;
    this.nextLevel();
  }

  nextLevel() {
    this.canClick = false;
    this.userSequence = [];
    this.stopTimer();
    if (this.level % 1 === 0 && this.additionalColors.length > 0) {
      const newColor = this.additionalColors.shift();
      if (newColor) {
        this.colors.push(newColor);
      }
    }
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
        this.startTimer();
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
    if (this.canClick) {
      this.selectedColor = color;
      this.userSequence.push(color);
    }
  }

  validateSequence() {
    this.stopTimer();
    if (this.gameService.isSequenceCorrect(this.sequence, this.userSequence)) {
      this.score += this.level * 10 * this.timer;
      this.level++;
      this.nextLevel();
    } else {
      this.endGame();
    }
  }

  startTimer() {
    this.timer = 15;
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.stopTimer();
        this.endGame();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  endGame() {
    this.gameOver = true;
    this.gameStarted = false;
    this.canClick = false;
    this.stopTimer();
  }

  resetSequence() {
    this.selectedColor = null;
    this.userSequence = [];
  }
}
