import { Component, OnInit } from '@angular/core';
import { RepairService } from '../../../core/services/repair.service';
import { RepairRequest } from '../../../core/models';

@Component({
  selector: 'app-admin-repairs',
  templateUrl: './admin-repairs.component.html',
  styleUrls: ['./admin-repairs.component.scss', '../products/admin-products.component.scss']
})
export class AdminRepairsComponent implements OnInit {
  repairs: RepairRequest[] = [];
  loading = false;
  page = 1;
  totalPages = 1;
  selected: RepairRequest | null = null;
  newStatus = '';
  finalPrice: number | null = null;
  error = '';

  constructor(private repairService: RepairService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.repairService.getAllRepairs(this.page).subscribe({
      next: r => {
        this.repairs = r.data;
        this.totalPages = r.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openDetail(r: RepairRequest): void {
    this.selected = r;
    this.newStatus = r.status;
    this.finalPrice = r.finalPrice ?? null;
    this.error = '';
  }

  updateStatus(): void {
    if (!this.selected || this.newStatus === this.selected.status) return;

    if (this.newStatus === 'READY' && (!this.finalPrice || this.finalPrice <= 0)) {
      this.error = 'Le prix final est obligatoire pour passer la réparation à Prêt';
      return;
    }

    this.repairService.updateRepairStatus(
      this.selected.id,
      this.newStatus,
      this.newStatus === 'READY' ? Number(this.finalPrice) : undefined,
    ).subscribe({
      next: () => {
        this.selected = null;
        this.load();
      },
      error: err => this.error = err.error?.message ?? 'Erreur'
    });
  }

  statusLabel(s: string): string {
    return {
      PENDING: 'En attente',
      IN_PROGRESS: 'En maintenance',
      READY: 'Prêt'
    }[s] ?? s;
  }

  dropOffLabel(repair: RepairRequest): string {
    return repair.dropOffOption === 'PICKUP_BY_DELIVERY'
      ? 'Livreur à envoyer'
      : 'Dépôt en boutique';
  }
}