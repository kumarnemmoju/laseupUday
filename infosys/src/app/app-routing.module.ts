import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { AddressesComponent } from './addresses/addresses.component';
import { PaymentComponent } from './payment/payment.component';
import { AuthService } from './auth.guard';
import { OrdersComponent } from './orders/orders.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }, // Open to everyone
  { path: 'signup', component: SignupComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'cart', component: CartComponent, canActivate: [AuthService] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [AuthService] },
  { path: 'addresses', component: AddressesComponent, canActivate: [AuthService] },
  { path: 'payment', component: PaymentComponent, canActivate: [AuthService] },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthService] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
