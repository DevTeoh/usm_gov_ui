import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatToolbarModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly appName = 'USM GOV';
  readonly links: FooterLink[] = [
    { label: 'Twitter', href: 'https://twitter.com', external: true },
    { label: 'Facebook', href: 'https://facebook.com', external: true },
  ];
}
