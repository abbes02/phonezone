import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoyaltyData } from '../models';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  constructor(private http: HttpClient) {}

  getLoyaltyData(): Observable<LoyaltyData> {
    return this.http.get<LoyaltyData>(`${environment.apiUrl}/loyalty/mine`);
  }
}
