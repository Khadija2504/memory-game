import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-score',
  standalone: false,
  
  templateUrl: './score.component.html',
  styleUrl: './score.component.css'
})
export class ScoreComponent {
  @Input() score: number = 0;
  @Input() level: number = 0;
}
