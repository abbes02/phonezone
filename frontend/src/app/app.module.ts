import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// Auth
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

// Client
import { HomeComponent } from './features/client/home/home.component';
import { CatalogComponent } from './features/client/catalog/catalog.component';
import { CartComponent } from './features/client/cart/cart.component';
import { OrdersComponent } from './features/client/orders/orders.component';
import { RepairsComponent } from './features/client/repairs/repairs.component';
import { LoyaltyComponent } from './features/client/loyalty/loyalty.component';
import { QuestionsComponent } from './features/client/questions/questions.component';
import { ProductDetailComponent } from './features/client/product-detail/product-detail.component';

// Admin
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';
import { AdminProductsComponent } from './features/admin/products/admin-products.component';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders.component';
import { AdminRepairsComponent } from './features/admin/repairs/admin-repairs.component';
import { AdminQuestionsComponent } from './features/admin/questions/admin-questions.component';
import { AdminNotificationsComponent } from './features/admin/notifications/admin-notifications.component';
import { AdminRepairServicesComponent } from './features/admin/repair-services/admin-repair-services.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent, RegisterComponent,
    HomeComponent, CatalogComponent, CartComponent, OrdersComponent,
    RepairsComponent, LoyaltyComponent, QuestionsComponent, ProductDetailComponent,
    AdminLayoutComponent, DashboardComponent,
    AdminUsersComponent, AdminProductsComponent, AdminOrdersComponent,
    AdminRepairsComponent, AdminQuestionsComponent, AdminNotificationsComponent,
    AdminRepairServicesComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
