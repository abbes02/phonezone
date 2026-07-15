import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RepairService } from '../../../core/services/repair.service';
import { RepairService as RepairSvc } from '../../../core/models';
import { assetUrl } from '../../../core/utils/asset-url';

@Component({ selector: 'app-admin-repair-services', templateUrl: './admin-repair-services.component.html', styleUrls: ['../products/admin-products.component.scss'] })
export class AdminRepairServicesComponent implements OnInit {
  services: RepairSvc[] = [];
  loading = false;
  showForm = false;
  editingId = '';
  error = '';
  selectedImage: File | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    indicativePrice: [null as number | null, [Validators.min(0.01)]],
  });

  constructor(private fb: FormBuilder, private repairService: RepairService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.repairService.getRepairServices().subscribe({ next: s => { this.services = s; this.loading = false; }, error: () => this.loading = false });
  }

  imageUrl(url?: string): string { return assetUrl(url); }

  openNew(): void {
    this.editingId = '';
    this.selectedImage = null;
    this.form.reset();
    this.showForm = true;
    this.error = '';
  }

  openEdit(s: RepairSvc): void {
    this.editingId = s.id;
    this.selectedImage = null;
    this.form.patchValue({ name: s.name, description: s.description, indicativePrice: s.indicativePrice ?? null });
    this.showForm = true;
    this.error = '';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImage = input.files?.[0] ?? null;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload = new FormData();
    Object.entries(this.form.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') payload.append(key, String(value));
    });
    if (this.selectedImage) payload.append('image', this.selectedImage);
    const obs = this.editingId
      ? this.repairService.updateRepairService(this.editingId, payload)
      : this.repairService.createRepairService(payload);
    obs.subscribe({ next: () => { this.showForm = false; this.load(); }, error: err => this.error = err.error?.message ?? 'Erreur' });
  }

  delete(id: string): void {
    if (!confirm('Supprimer ce service ?')) return;
    this.repairService.deleteRepairService(id).subscribe({ next: () => this.load(), error: err => alert(err.error?.message ?? 'Erreur') });
  }
}
