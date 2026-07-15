import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../../../core/services/question.service';
import { Question } from '../../../core/models';

@Component({ selector: 'app-admin-questions', templateUrl: './admin-questions.component.html', styleUrls: ['../products/admin-products.component.scss'] })
export class AdminQuestionsComponent implements OnInit {
  questions: Question[] = [];
  loading = false;
  page = 1;
  totalPages = 1;
  selected: Question | null = null;
  answer = '';
  error = '';

  constructor(private questionService: QuestionService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.questionService.getAllQuestions(this.page).subscribe({
      next: r => { this.questions = r.data; this.totalPages = r.totalPages; this.loading = false; },
      error: () => this.loading = false
    });
  }

  open(q: Question): void { this.selected = q; this.answer = q.adminResponse ?? ''; this.error = ''; }

  sendAnswer(): void {
    if (!this.selected || !this.answer.trim()) return;
    this.questionService.answerQuestion(this.selected.id, this.answer).subscribe({
      next: () => { this.selected = null; this.load(); },
      error: err => this.error = err.error?.message ?? 'Erreur'
    });
  }
}
