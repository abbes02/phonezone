import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RepairService } from '../../../core/services/repair.service';
import { SocketService } from '../../../core/services/socket.service';
import { AuthService } from '../../../core/services/auth.service';
import { RepairService as RepairSvc, RepairRequest } from '../../../core/models';
import { assetUrl } from '../../../core/utils/asset-url';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-repairs',
  templateUrl: './repairs.component.html',
  styleUrls: ['./repairs.component.scss']
})
export class RepairsComponent implements OnInit, OnDestroy {
  tab = 'services';
  services: RepairSvc[] = [];
  myRepairs: RepairRequest[] = [];
  loading = false;
  submitting = false;
  confirmed = false;
  refNumber = '';
  error = '';
  showForm = false;
  selectedServiceId = '';
  recoveryForm: { [id: string]: string } = {};
  selectedPhotos: File[] = [];
  loyaltyMessage = '';
  private sub = new Subscription();

form = this.fb.group({
  serviceId: ['', Validators.required],
  phoneModel: ['', Validators.required],
  problemDescription: ['', Validators.required],
  contactInfo: ['', Validators.required],

  dropOffOption: ['IN_STORE', Validators.required],
  pickupPhone: [''],
  pickupCity: ['Sousse'],
  pickupAddress: [''],
});

  constructor(
    private fb: FormBuilder,
    private repairService: RepairService,
    private socket: SocketService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadServices();

    if (this.auth.isAuthenticated()) {
      this.loadMyRepairs();
      this.socket.connect();

      this.sub.add(this.socket.onRepairStatusUpdate().subscribe((data: any) => {
        const idx = this.myRepairs.findIndex(r => r.id === data.id);

        if (idx >= 0) {
          const statusHistory = data.history
            ? [...(this.myRepairs[idx].statusHistory ?? []), data.history]
            : this.myRepairs[idx].statusHistory;

          this.myRepairs[idx] = {
            ...this.myRepairs[idx],
            status: data.status,
            finalPrice: data.finalPrice ?? this.myRepairs[idx].finalPrice,
            discountApplied: data.discountApplied ?? this.myRepairs[idx].discountApplied,
            statusHistory,
          };
        } else {
          this.loadMyRepairs();
        }
      }));

      this.sub.add(this.socket.onLoyaltyReward().subscribe((data: any) => {
        this.loyaltyMessage = data.message ?? 'Un avantage fidélité est disponible.';
      }));
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadServices(): void {
    this.repairService.getRepairServices().subscribe(s => this.services = s);
  }

  loadMyRepairs(): void {
    this.repairService.getMyRepairs().subscribe(r => this.myRepairs = r);
  }

  imageUrl(url?: string): string {
    return assetUrl(url);
  }

  openForm(serviceId: string): void {
    this.selectedServiceId = serviceId;

    this.form.reset({

     serviceId,
     phoneModel: '',
     problemDescription: '',
     contactInfo: '',
     dropOffOption: 'IN_STORE',
     pickupPhone: '',
     pickupCity: 'Sousse',
     pickupAddress: '',
});

    this.showForm = true;
    this.confirmed = false;
    this.error = '';
    this.selectedPhotos = [];
  }

  onDropOffOptionChange(option: 'IN_STORE' | 'PICKUP_BY_DELIVERY'): void {
    this.form.patchValue({
      dropOffOption: option,
      pickupCity: 'Sousse'
    });

    this.error = '';
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedPhotos = Array.from(input.files ?? []);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    if (
      value.dropOffOption === 'PICKUP_BY_DELIVERY' &&
      (
        !value.pickupPhone?.trim() ||
        !value.pickupAddress?.trim()
      )
    ) {
      this.error = 'Veuillez saisir le téléphone et l’adresse de collecte à Sousse.';
      return;
    }

    this.submitting = true;
    this.error = '';

    const payload = new FormData();

    Object.entries(this.form.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        payload.append(key, String(value));
      }
    });

    if (value.dropOffOption === 'PICKUP_BY_DELIVERY') {
      payload.set('pickupCity', 'Sousse');
    }

    this.selectedPhotos.forEach(file => payload.append('photos', file));

    this.repairService.createRepairRequest(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.confirmed = true;
        this.refNumber = res.repair.referenceNumber;
        this.showForm = false;
        this.loadMyRepairs();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message ?? 'Erreur';
      }
    });
  }

  setRecovery(repair: RepairRequest, option: string): void {
    this.repairService.setRecoveryOption(repair.id, option).subscribe({
      next: () => this.loadMyRepairs()
    });
  }

  statusLabel(status: RepairRequest['status']): string {
    return {
      PENDING: 'En attente',
      IN_PROGRESS: 'En maintenance',
      READY: 'Prêt',
    }[status];
  }

  dropOffLabel(repair: RepairRequest): string {
    return repair.dropOffOption === 'PICKUP_BY_DELIVERY'
      ? 'Livreur demandé'
      : 'Dépôt en boutique';
  }
}