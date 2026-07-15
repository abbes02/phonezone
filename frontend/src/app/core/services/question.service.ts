import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Question, PaginatedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private url = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) {}

  createQuestion(formData: FormData): Observable<Question> {
    return this.http.post<Question>(this.url, formData);
  }

  getMyQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.url}/mine`);
  }

  getAllQuestions(page = 1, limit = 10): Observable<PaginatedResult<Question>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedResult<Question>>(this.url, { params });
  }

  getQuestion(id: string): Observable<Question> {
    return this.http.get<Question>(`${this.url}/${id}`);
  }

  answerQuestion(id: string, adminResponse: string): Observable<Question> {
    return this.http.post<Question>(`${this.url}/${id}/answer`, { adminResponse });
  }
}
