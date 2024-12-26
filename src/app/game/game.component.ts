import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game',
  standalone: false,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  sequence: string[] = [];
  userSequence: string[] = [];
  colors: string[] = ['red', 'blue', 'green', 'yellow'];
  showSequence: boolean = false;
  currentLevel: number = 0;
  gameOver: boolean = false;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.startGame();
  }

  startGame(): void {
    this.gameService.startGame();
    this.sequence = this.gameService.getSequence();
    this.currentLevel = this.gameService.getLevel();
    this.showSequence = true;
    this.gameOver = false;
    setTimeout(() => {
      this.showSequence = false;
    }, 15000); // 15 seconds
  }

  handleColorClick(color: string): void {
    if (this.showSequence || this.gameOver) return;
    this.gameService.addUserInput(color);
    this.userSequence.push(color);
  }

  validate(): void {
    if (this.gameService.validateSequence()) {
      this.gameService.resetUserSequence();
      this.gameService.addColor();
      this.sequence = this.gameService.getSequence();
      this.currentLevel = this.gameService.getLevel();
      this.userSequence = [];
      this.showSequence = true;
      setTimeout(() => {
        this.showSequence = false;
      }, 15000); // 15 seconds
    } else {
      this.gameOver = true;
    }
  }

  reset(): void {
    this.userSequence = [];
  }
}
