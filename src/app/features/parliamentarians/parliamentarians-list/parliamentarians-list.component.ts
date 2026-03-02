import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-parliamentarians-list',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './parliamentarians-list.component.html',
  styleUrl: './parliamentarians-list.component.css',
})
export class ParliamentariansListComponent {}
