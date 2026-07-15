import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { QuestionService } from '../../../core/services/question.service';
import { SocketService } from '../../../core/services/socket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Question } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({ selector: 'app-questions', templateUrl: './questions.component.html', styleUrls: ['./questions.component.scss'] })
export class QuestionsComponent implements OnInit, OnDestroy {
  myQuestions: Question[] = [];
  loading = false;
  submitting = false;
  confirmed = false;
  error = '';
  selectedFiles: File[] = [];
  fileError = '';
  private sub = new Subscription();

  form = this.fb.group({
    subject: ['', Validators.required],
    description: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private socket: SocketService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.loadMyQuestions();
      this.socket.connect();
      this.sub.add(this.socket.onQuestionAnswered().subscribe(() => this.loadMyQuestions()));
    }
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  loadMyQuestions(): void {
    this.questionService.getMyQuestions().subscribe(q => this.myQuestions = q);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = '';
    if (!input.files) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    this.selectedFiles = [];
    for (const file of Array.from(input.files)) {
      if (!allowed.includes(file.type)) { this.fileError = `Format non supporté : ${file.name} (JPEG, PNG, WEBP uniquement)`; return; }
      if (file.size > maxSize) { this.fileError = `Fichier trop volumineux : ${file.name} (max 5 Mo)`; return; }
      this.selectedFiles.push(file);
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.fileError) return;
    this.submitting = true;
    this.error = '';
    const fd = new FormData();
    fd.append('subject', this.form.value.subject!);
    fd.append('description', this.form.value.description!);
    this.selectedFiles.forEach(f => fd.append('photos', f));
    this.questionService.createQuestion(fd).subscribe({
      next: () => { this.submitting = false; this.confirmed = true; this.form.reset(); this.selectedFiles = []; this.loadMyQuestions(); },
      error: err => { this.submitting = false; this.error = err.error?.message ?? 'Erreur lors de l\'envoi'; }
    });
  }
}
