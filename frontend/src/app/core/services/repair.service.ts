import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RepairService as RepairSvc, RepairRequest, PaginatedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class RepairService {
  private svcUrl = `${environment.apiUrl}/repair-services`;
  private reqUrl = `${environment.apiUrl}/repair-requests`;

  constructor(private http: HttpClient) {}

  getRepairServices(): Observable<RepairSvc[]> {
    return this.http.get<RepairSvc[]>(this.svcUrl);
  }

  createRepairService(dto: Partial<RepairSvc> | FormData): Observable<RepairSvc> {
    return this.http.post<RepairSvc>(this.svcUrl, dto);
  }

  updateRepairService(id: string, dto: Partial<RepairSvc> | FormData): Observable<RepairSvc> {
    return this.http.patch<RepairSvc>(`${this.svcUrl}/${id}`, dto);
  }

  deleteRepairService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.svcUrl}/${id}`);
  }

  createRepairRequest(dto: any | FormData): Observable<{ repair: RepairRequest; paymentInfo: string }> {
    return this.http.post<{ repair: RepairRequest; paymentInfo: string }>(this.reqUrl, dto);
  }

  getMyRepairs(): Observable<RepairRequest[]> {
    return this.http.get<RepairRequest[]>(`${this.reqUrl}/mine`);
  }

  getAllRepairs(page = 1, limit = 10): Observable<PaginatedResult<RepairRequest>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedResult<RepairRequest>>(this.reqUrl, { params });
  }

  updateRepairStatus(id: string, status: string, finalPrice?: number): Observable<RepairRequest> {
    return this.http.patch<RepairRequest>(`${this.reqUrl}/${id}/status`, { status, finalPrice });
  }

  setRecoveryOption(id: string, option: string, deliveryAddress?: string): Observable<any> {
    return this.http.patch(`${this.reqUrl}/${id}/recovery`, { option, deliveryAddress });
  }
}
