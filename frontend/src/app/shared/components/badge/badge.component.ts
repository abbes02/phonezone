import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  template: `<span class="badge" [ngClass]="badgeClass">{{ label }}</span>`,
  styles: [`
    .badge { display:inline-block; padding:3px 10px; border-radius:9999px; font-size:.75rem; font-weight:600; }
    .badge-pending { background:#F1F5F9; color:#64748B; }
    .badge-progress { background:#FEF3C7; color:#D97706; }
    .badge-ready, .badge-delivered { background:#DCFCE7; color:#16A34A; }
    .badge-cancelled { background:#FEE2E2; color:#DC2626; }
    .badge-answered { background:#DBEAFE; color:#1D4ED8; }
    .badge-default { background:#E2E8F0; color:#475569; }
  `]
})
export class BadgeComponent {
  @Input() status = '';

  get label(): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', IN_PROGRESS: 'En maintenance', READY: 'Prêt',
      CONFIRMED: 'Confirmé', SHIPPED: 'Expédié', DELIVERED: 'Livré',
      CANCELLED: 'Annulé', answered: 'Répondu', unanswered: 'En attente',
    };
    return map[this.status] ?? this.status;
  }

  get badgeClass(): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress', READY: 'badge-ready',
      CONFIRMED: 'badge-progress', SHIPPED: 'badge-progress', DELIVERED: 'badge-delivered',
      CANCELLED: 'badge-cancelled', answered: 'badge-answered',
    };
    return map[this.status] ?? 'badge-default';
  }
}
