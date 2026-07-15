import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { ClientGuard } from './core/guards/client.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/client/home/home.component';
import { CatalogComponent } from './features/client/catalog/catalog.component';
import { CartComponent } from './features/client/cart/cart.component';
import { OrdersComponent } from './features/client/orders/orders.component';
import { RepairsComponent } from './features/client/repairs/repairs.component';
import { LoyaltyComponent } from './features/client/loyalty/loyalty.component';
import { QuestionsComponent } from './features/client/questions/questions.component';
import { ProductDetailComponent } from './features/client/product-detail/product-detail.component';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';
import { AdminProductsComponent } from './features/admin/products/admin-products.component';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders.component';
import { AdminRepairsComponent } from './features/admin/repairs/admin-repairs.component';
import { AdminQuestionsComponent } from './features/admin/questions/admin-questions.component';
import { AdminNotificationsComponent } from './features/admin/notifications/admin-notifications.component';
import { AdminRepairServicesComponent } from './features/admin/repair-services/admin-repair-services.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'home', component: HomeComponent, canActivate: [ClientGuard] },
  { path: 'catalog', component: CatalogComponent, canActivate: [ClientGuard] },
  { path: 'product/:id', component: ProductDetailComponent, canActivate: [ClientGuard] },
  {
  path: 'cart',
  component: CartComponent,
},
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'repairs', component: RepairsComponent },
  { path: 'loyalty', component: LoyaltyComponent, canActivate: [AuthGuard] },
  { path: 'questions', component: QuestionsComponent, canActivate: [AuthGuard] },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'repairs', component: AdminRepairsComponent },
      { path: 'questions', component: AdminQuestionsComponent },
      { path: 'notifications', component: AdminNotificationsComponent },
      { path: 'repair-services', component: AdminRepairServicesComponent },
    ]
  },

  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
