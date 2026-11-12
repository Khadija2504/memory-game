import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameComponent } from './game.component';
import { ScoreComponent } from '../score/score.component';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameComponent, ScoreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    component.sound.muted = true;
    fixture.detectChanges();
  });

  it('should create on the menu', () => {
    expect(component).toBeTruthy();
    expect(component.phase).toBe('menu');
  });

  it('starts a game with 4 pads and a 1-step sequence', () => {
    component.startGame();
    expect(component.phase).toBe('showing');
    expect(component.pads.length).toBe(4);
    expect(component.sequence.length).toBe(1);
  });

  it('a wrong pad costs a life and replays the same sequence', () => {
    component.phase = 'input';
    component.sequence = [0];
    component.press(1);
    expect(component.lives).toBe(2);
    expect(component.phase).toBe('miss');
    expect(component.wrongPad).toBe(1);
    expect(component.hintPad).toBe(0);
    expect(component.sequence).toEqual([0]);
  });

  it('ends the game after the third mistake', () => {
    component.sequence = [0];
    for (let i = 0; i < 3; i++) {
      component.phase = 'input';
      component.input = [];
      component.press(1);
    }
    expect(component.lives).toBe(0);
    expect(component.phase).toBe('over');
  });

  it('restores all lives on a new game', () => {
    component.lives = 1;
    component.startGame();
    expect(component.lives).toBe(3);
  });

  it('scores a completed round', () => {
    component.phase = 'input';
    component.sequence = [2];
    component.timeLeft = 5;
    component.press(2);
    expect(component.phase).toBe('success');
    expect(component.score).toBeGreaterThan(0);
  });

  it('ignores presses outside the input phase', () => {
    component.phase = 'showing';
    component.sequence = [0];
    component.press(1);
    expect(component.phase).toBe('showing');
  });
});
