import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  error = '';
  loading = false;
  returnUrl: string = '/home';

  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private cart: CartService,
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        this.loading = false;

        const pending = localStorage.getItem('pendingCartItem');

        if (pending) {
          const product = JSON.parse(pending);
          this.cart.addItem(product, 1);
          localStorage.removeItem('pendingCartItem');
        }

        this.router.navigateByUrl(
          res.user.role === 'ADMIN' ? '/admin/dashboard' : this.returnUrl,
        );
      },

      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Identifiants invalides';
      },
    });
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.touched && control.invalid);
  }
}