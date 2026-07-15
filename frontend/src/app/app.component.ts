import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar *ngIf="!isRegisterPage"></app-navbar>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  constructor(private router: Router) {}

  get isRegisterPage(): boolean {
    return this.router.url.startsWith('/register');
  }
}