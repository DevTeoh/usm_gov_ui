import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import type { UserRole } from '../../core/models/user.model';

interface NavItem {
  label: string;
  route: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    FooterComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);
  readonly user = this.auth.user;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Complaints', route: '/complaints' },
    { label: 'Parliamentarians', route: '/parliamentarians' },
    { label: 'Projects', route: '/projects' },
    { label: 'My Account', route: '/profile' },
  ];

  readonly visibleNavItems = computed(() => {
    const u = this.auth.user();
    const role = u?.role;
    if (!role) return this.navItems;
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    });
  });


  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
