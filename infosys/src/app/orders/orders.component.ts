import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { PaymentService } from '../payment.service';
import { ProductsService } from '../products.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  userOrders: any[] = [];
  isLoading = true;
  allTrackedData: any[] = [];
  orderStatuses: { [key: number]: any } = {}; // Precomputed order statuses
  selectedOrderId: number | null = null; // Track the currently selected order

  constructor(
    private userService: UserService,
    private router: Router,
    private paymentService: PaymentService,
    private productService: ProductsService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;

    const user = localStorage.getItem('user');
    if (!user) {
      console.error('No user found in localStorage');
      this.isLoading = false;
      return;
    }

    const userId = JSON.parse(user).id;

    forkJoin({
      users: this.userService.getCompleteUsersData(),
      trackings: this.productService.getAllTrackingDetails(),
    }).subscribe(
      (res: any) => {
        const users = res.users;
        this.allTrackedData = res.trackings || [];

        const currentUser = users.find((u: any) => u.id === userId);
        if (currentUser && currentUser.Orders) {
          this.userOrders = currentUser.Orders.map((order: any) => ({
            ...order,
            showStepper: false, // Add showStepper property
          }));
          this.precomputeOrderStatuses(); // Precompute statuses after both data sets are loaded
        }

        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      }
    );
  }

  precomputeOrderStatuses() {
    this.orderStatuses = {}; // Reset the statuses
    if (this.allTrackedData) {
      this.userOrders.forEach((order) => {
        console.log('Looking for Order ID:', order.orderId); // Debug log
        const status = this.allTrackedData.find((h) => h.orderId == order.orderId) || {};
        this.orderStatuses[order.orderId] = status;
        console.log('Order Status for Order ID', order.orderId, ':', status); // Debug log
      });
    }
  }

  toggleStepper(orderId: number) {
    if (this.selectedOrderId === orderId) {
      // If the same order is clicked again, hide the stepper
      this.selectedOrderId = null;
    } else {
      // Show the stepper for the selected order and hide others
      this.selectedOrderId = orderId;
    }
  }

  shopNow() {
    this.router.navigate(['/home']);
  }

  downloadInvoice(order: any) {
    this.paymentService.generateInvoice(order).subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error generating invoice:', error);
      }
    );
  }
}