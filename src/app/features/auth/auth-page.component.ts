import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideArrowRight,
  LucideEye,
  LucideEyeOff,
  LucideKeyRound,
  LucideLoaderCircle,
  LucideLockKeyhole,
  LucideMail,
  LucideShieldCheck,
  LucideUser
} from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideArrowRight,
    LucideEye,
    LucideEyeOff,
    LucideKeyRound,
    LucideLoaderCircle,
    LucideLockKeyhole,
    LucideMail,
    LucideShieldCheck,
    LucideUser
  ],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<AuthMode>('login');
  readonly showPassword = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly title = computed(() =>
    this.mode() === 'login' ? 'Sign in to your account' : 'Create your account'
  );
  readonly actionLabel = computed(() => (this.mode() === 'login' ? 'Sign in' : 'Create account'));

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.errorMessage.set(null);
    this.form.reset();
    this.form.controls.name.setValidators(
      mode === 'register'
        ? [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
        : [Validators.minLength(2), Validators.maxLength(100)]
    );
    this.form.controls.password.setValidators(
      mode === 'register' ? [Validators.required, Validators.minLength(8)] : [Validators.required]
    );
    this.form.controls.name.updateValueAndValidity();
    this.form.controls.password.updateValueAndValidity();
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { name, email, password } = this.form.getRawValue();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const request =
      this.mode() === 'register'
        ? this.auth.register({ name: name.trim(), email: normalizedEmail, password: normalizedPassword })
        : this.auth.login({ email: normalizedEmail, password: normalizedPassword });

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.error ?? 'Authentication failed. Please try again.');
      }
    });
  }
}
