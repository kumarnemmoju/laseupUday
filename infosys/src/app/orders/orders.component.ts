import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  userOrders: any[] = [];
  isLoading = true;

  constructor(private userService: UserService,private router:Router,private paymentService:PaymentService) {}

  ngOnInit(): void {
    this.fetchUserOrders();
  }

  fetchUserOrders(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe((users: any[]) => {
        const currentUser = users.find(u => u.id === userId);
        if (currentUser && currentUser.Orders) {
          this.userOrders = currentUser.Orders;
        }
      }, (error) => {
        console.error('Error fetching user orders:', error);
      });
    } else {
      console.error('No user found in localStorage');
    }
  }

  shopNow(){
    
    this.router.navigate(['/home']);
  }

  downloadInvoice(order:any){
    this.paymentService.generateInvoice(order).subscribe(
      (response: Blob) => {
        // Create a Blob URL for the PDF
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        // Create a link element and trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice.pdf'; // Set the file name
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error generating invoice:', error);
        // Optionally, show a user-friendly error message
      }
    );
  }

}