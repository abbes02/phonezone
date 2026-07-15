import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  error = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]],
    },
    {
      validators: this.matchPasswords
    }
  );

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  matchPasswords(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;

    return password === confirm ? null : { mismatch: true };
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { fullName, email, password } = this.form.value;

    this.auth.register(fullName!, email!, password!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Erreur lors de l’inscription';
      }
    });
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.invalid;
  }
}