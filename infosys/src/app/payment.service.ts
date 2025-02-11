import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private orderDetailsSource = new BehaviorSubject<any>(null);
  orderDetails$ = this.orderDetailsSource.asObservable();
  private apiUrl = 'http://localhost:3000/generate-invoice'; // Your backend API URL

  constructor(private http: HttpClient) {}

  setOrderDetails(order: any) {
    this.orderDetailsSource.next(order);
  }

  getOrderDetails() {
    return this.orderDetailsSource.value;
  }

  generateInvoice(orderDetails: any) {
    return this.http.post(this.apiUrl, orderDetails, { responseType: 'blob' });
  }

  
}
