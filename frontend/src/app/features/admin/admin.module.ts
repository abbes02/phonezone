import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminGuard } from '../../core/guards/admin.guard';

import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminUsersComponent } from './users/admin-users.component';
import { AdminProductsComponent } from './products/admin-products.component';
import { AdminOrdersComponent } from './orders/admin-orders.component';
import { AdminRepairsComponent } from './repairs/admin-repairs.component';
import { AdminQuestionsComponent } from './questions/admin-questions.component';
import { AdminNotificationsComponent } from './notifications/admin-notifications.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    AdminUsersComponent,
    AdminProductsComponent,
    AdminOrdersComponent,
    AdminRepairsComponent,
    AdminQuestionsComponent,
    AdminNotificationsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [AdminGuard],
        children: [
          { path: '',              redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard',     component: DashboardComponent },
          { path: 'users',         component: AdminUsersComponent },
          { path: 'products',      component: AdminProductsComponent },
          { path: 'orders',        component: AdminOrdersComponent },
          { path: 'repairs',       component: AdminRepairsComponent },
          { path: 'questions',     component: AdminQuestionsComponent },
          { path: 'notifications', component: AdminNotificationsComponent }
        ]
      }
    ])
  ]
})
export class AdminModule {}
