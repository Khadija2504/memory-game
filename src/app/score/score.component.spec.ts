import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreComponent } from './score.component';

describe('ScoreComponent', () => {
  let component: ScoreComponent;
  let fixture: ComponentFixture<ScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScoreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rounds seconds up and flags low time only while running', () => {
    component.timeLeft = 2.2;
    component.timeTotal = 10;
    expect(component.seconds).toBe(3);
    expect(component.low).toBeFalse();
    component.running = true;
    expect(component.low).toBeTrue();
  });
});
