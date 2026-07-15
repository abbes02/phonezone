import { Component, OnInit } from '@angular/core';
import { LoyaltyService } from '../../../core/services/loyalty.service';
import { LoyaltyData } from '../../../core/models';

@Component({ selector: 'app-loyalty', templateUrl: './loyalty.component.html', styleUrls: ['./loyalty.component.scss'] })
export class LoyaltyComponent implements OnInit {
  data: LoyaltyData | null = null;
  loading = false;

  constructor(private loyaltyService: LoyaltyService) {}
  ngOnInit(): void {
    this.loading = true;
    this.loyaltyService.getLoyaltyData().subscribe({ next: d => { this.data = d; this.loading = false; }, error: () => this.loading = false });
  }

  get screenProgress(): number { return this.data ? (this.data.counter.screenProtectorCount % 5) / 5 * 100 : 0; }
  get repairProgress(): number { return this.data ? (this.data.counter.repairCount % 5) / 5 * 100 : 0; }
}
