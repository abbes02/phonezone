import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { BadgeComponent } from './components/badge/badge.component';
import { PaginationComponent } from './components/pagination/pagination.component';

@NgModule({
  declarations: [NavbarComponent, SpinnerComponent, BadgeComponent, PaginationComponent],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  exports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    NavbarComponent, SpinnerComponent, BadgeComponent, PaginationComponent
  ],
})
export class SharedModule {}
