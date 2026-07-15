import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-overlay { display:flex; justify-content:center; align-items:center; padding:40px; }
    .spinner { width:40px; height:40px; border:4px solid #E2E8F0; border-top-color:#1A237E; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class SpinnerComponent {}
