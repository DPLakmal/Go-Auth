import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideBadgeCheck,
  LucideLoaderCircle,
  LucideLogOut,
  LucideRefreshCw,
  LucideServer,
  LucideShieldCheck,
  LucideTriangleAlert,
  LucideUser
} from '@lucide/angular';
import { AuthUser } from '../../core/auth/auth.models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    LucideBadgeCheck,
    LucideLoaderCircle,
    LucideLogOut,
    LucideRefreshCw,
    LucideServer,
    LucideShieldCheck,
    LucideTriangleAlert,
    LucideUser
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = computed<AuthUser | null>(() => this.auth.user());
  readonly isLoading = signal(true);
  readonly isLoggingOut = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.reloadProfile();
  }

  reloadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.loadCurrentUser().subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (!user) {
          this.errorMessage.set('Session could not be verified. Please sign in again.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to load the current user.');
      }
    });
  }

  logout(): void {
    this.isLoggingOut.set(true);
    this.auth.logout().subscribe(() => {
      this.isLoggingOut.set(false);
      this.router.navigateByUrl('/auth');
    });
  }
}
