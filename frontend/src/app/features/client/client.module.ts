import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ClientGuard } from '../../core/guards/client.guard';

import { HomeComponent } from './home/home.component';
import { CatalogComponent } from './catalog/catalog.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { OrdersComponent } from './orders/orders.component';
import { RepairsComponent } from './repairs/repairs.component';
import { LoyaltyComponent } from './loyalty/loyalty.component';
import { QuestionsComponent } from './questions/questions.component';

@NgModule({
  declarations: [
    HomeComponent,
    CatalogComponent,
    ProductDetailComponent,
    CartComponent,
    OrdersComponent,
    RepairsComponent,
    LoyaltyComponent,
    QuestionsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: 'home',       component: HomeComponent,          canActivate: [ClientGuard] },
      { path: 'catalog',    component: CatalogComponent,       canActivate: [ClientGuard] },
      { path: 'product/:id',component: ProductDetailComponent, canActivate: [ClientGuard] },
      { path: 'cart',       component: CartComponent,          canActivate: [AuthGuard] },
      { path: 'orders',     component: OrdersComponent,        canActivate: [AuthGuard] },
      { path: 'repairs',    component: RepairsComponent,       canActivate: [AuthGuard] },
      { path: 'loyalty',    component: LoyaltyComponent,       canActivate: [AuthGuard] },
      { path: 'questions',  component: QuestionsComponent,     canActivate: [AuthGuard] }
    ])
  ]
})
export class ClientModule {}
