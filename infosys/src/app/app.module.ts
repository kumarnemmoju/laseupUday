import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { SigninComponent } from './signin/signin.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { SignupComponent } from './signup/signup.component';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { AddressesComponent } from './addresses/addresses.component';
import { PaymentComponent } from './payment/payment.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrdersComponent } from './orders/orders.component';
import { TrackStatusComponent } from './track-status/track-status.component';
import { GetOrderStatusPipe } from './get-order-status.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignupComponent,
    SigninComponent,
    CartComponent,
    WishlistComponent,
    AddressesComponent,
    PaymentComponent,
    OrdersComponent,
    TrackStatusComponent,
    GetOrderStatusPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
