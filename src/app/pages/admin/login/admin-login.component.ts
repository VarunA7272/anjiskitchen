import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page admin-layout">
      <div class="login-card">
        <div class="login-logo">
          <img src="assets/logo.png" alt="Anji's Kitchen" />
        </div>
        <h1 class="login-title">Admin Panel</h1>
        <p class="login-sub">Sign in to manage your store</p>

        @if (error()) {
          <div class="error-alert">{{ error() }}</div>
        }

        <form (ngSubmit)="signIn()" class="login-form">
          <div class="form-group">
            <label class="form-label" for="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              class="form-input dark-input"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="admin@example.com"
              autocomplete="email"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="admin-password">Password</label>
            <div class="password-wrap">
              <input
                id="admin-password"
                [type]="showPassword() ? 'text' : 'password'"
                class="form-input dark-input"
                [(ngModel)]="password"
                name="password"
                required
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-pw" (click)="togglePassword()" aria-label="Toggle password">
                @if (showPassword()) {
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                } @else {
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary login-btn" id="admin-login-btn" [disabled]="loading()">
            @if (loading()) { Signing in... } @else { Sign In }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a0e09, #2C1A12, #1a0e09);
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: rgba(40, 22, 32, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(232, 105, 154, 0.2);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      box-shadow: 0 40px 120px rgba(0,0,0,0.5);
    }

    .login-logo {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .login-logo img {
      height: 80px;
      width: auto;
      filter: brightness(1.1);
    }

    .login-title {
      font-family: var(--font-heading);
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
      text-align: center;
      margin-bottom: 0.25rem;
    }

    .login-sub {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.5);
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .dark-input {
      background: rgba(255,255,255,0.07);
      border-color: rgba(232,105,154,0.2);
      color: #fff;
    }

    .dark-input::placeholder { color: rgba(255,255,255,0.3); }

    .dark-input:focus {
      border-color: var(--rose);
      box-shadow: 0 0 0 3px rgba(232,105,154,0.15);
      background: rgba(255,255,255,0.1);
    }

    .password-wrap { position: relative; }
    .toggle-pw {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255,255,255,0.4);
      transition: color var(--transition-fast);
    }
    .toggle-pw:hover { color: var(--rose-light); }

    .login-btn {
      width: 100%;
      justify-content: center;
      padding: 0.875rem;
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .error-alert {
      padding: 0.875rem 1rem;
      border-radius: var(--radius-sm);
      background: rgba(229, 62, 62, 0.15);
      border: 1px solid rgba(229, 62, 62, 0.3);
      color: #fc8181;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
  `]
})
export class AdminLoginComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  async ngOnInit() {
    const session = await this.supabase.getSession();
    if (session) this.router.navigate(['/admin/dashboard']);
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async signIn() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const { error } = await this.supabase.signIn(this.email, this.password);
      if (error) {
        this.error.set(error.message || 'Invalid email or password');
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
    } catch {
      this.error.set('Something went wrong. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
