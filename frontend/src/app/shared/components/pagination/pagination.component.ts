import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <div class="pagination" *ngIf="totalPages > 1">
      <button class="page-btn" [disabled]="currentPage === 1" (click)="go(currentPage - 1)">‹</button>
      <button class="page-btn" *ngFor="let p of pages"
        [class.active]="p === currentPage" (click)="go(p)">{{ p }}</button>
      <button class="page-btn" [disabled]="currentPage === totalPages" (click)="go(currentPage + 1)">›</button>
    </div>
  `,
  styles: [`
    .pagination { display:flex; gap:6px; justify-content:center; margin-top:24px; }
    .page-btn { width:36px; height:36px; border:1px solid #E2E8F0; border-radius:8px; background:#fff; cursor:pointer; font-size:.875rem; transition:all .2s; }
    .page-btn:hover:not(:disabled) { border-color:#1A237E; color:#1A237E; }
    .page-btn.active { background:#1A237E; color:#fff; border-color:#1A237E; }
    .page-btn:disabled { opacity:.4; cursor:not-allowed; }
  `]
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  go(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.pageChange.emit(page);
  }
}
