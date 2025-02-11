import { Component } from '@angular/core';
import { PaymentService } from '../payment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent {
  selectedPayment: string = 'card';
  errorMessage: string = '';
  amount: number = 0;
  creditCardForm!: FormGroup;
  orderDetails: any;
  currentDate!: string;
  isLoading = true;
  showPaymentSuccessModal = false;

  constructor(
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);

    this.creditCardForm = this.fb.group({
      cardHolderName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{12,19}$/)]],
      expiration: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });

    this.orderDetails = this.paymentService.getOrderDetails();

    if (!this.orderDetails || !this.orderDetails.grandTotal || this.orderDetails.grandTotal <= 0) {
      this.router.navigate(['/home']);
      return;
    }

    this.amount = this.orderDetails.grandTotal;
  }

  // Format card number with spaces every 4 digits
  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s+/g, ''); // Remove existing spaces
    if (value.length > 16) value = value.substring(0, 16); // Limit to 16 digits
    value = value.replace(/(\d{4})/g, '$1 ').trim(); // Add space every 4 digits
    input.value = value;
    this.creditCardForm.get('cardNumber')?.setValue(value.replace(/\s+/g, ''), { emitEvent: false });
  }

  // Format expiration date with a slash after 2 digits
  formatExpirationDate(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 4) value = value.substring(0, 4); // Limit to 4 digits
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2); // Add slash after 2 digits
    }
    input.value = value;
    this.creditCardForm.get('expiration')?.setValue(value, { emitEvent: false });
  }

  selectPaymentMode(mode: string) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    if (mode === 'card') {
      this.selectedPayment = 'card';
      this.errorMessage = '';
    } else {
      this.selectedPayment = '';
      this.errorMessage = 'Only Credit/Debit Card payments are allowed!';
    }
  }

  makePayment() {
    if (this.creditCardForm.invalid) {
      return;
    }

    this.isLoading = true;

    const today = new Date();
    this.currentDate = today.toLocaleDateString('en-US');
    delete this.creditCardForm.value.cvv;

    if (!this.orderDetails.finalAddress) {
      this.isLoading = false;
      return;
    }

    setTimeout(() => {
      this.isLoading = false;
      this.showPaymentSuccessModal = true;

      const finalOrder = {
        orderId: Math.floor(Math.random() * 900000) + 100000,
        orderedProducts: JSON.parse(JSON.stringify(this.orderDetails.cartItems)),
        deliveredAddress: this.orderDetails.finalAddress,
        totalItems: this.orderDetails.totalItems,
        orderPlacedOn: this.currentDate,
        returnPolicy: 'yes',
        cardPayments: this.creditCardForm.value,
        totalGSTApplied: this.orderDetails.totalGST,
        grandTotal: this.orderDetails.grandTotal,
      };
      this.downloadInvoice(finalOrder);
      this.updateTheOrder(finalOrder);
    }, 1000);
  }

  updateTheOrder(order: any) {
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe(
        (users: any[]) => {
          const userData = users.find((u) => u.id === userId);
          if (userData) {
            const orderCopy = JSON.parse(JSON.stringify(order));
            if (!userData.Orders) {
              userData.Orders = [];
            }
            userData.Orders.push(orderCopy);
            userData.Cart = [];
            this.userService.updatingUserData(userData).subscribe(
              () => {
                localStorage.setItem('user', JSON.stringify(userData));
              },
              (error) => {
                console.error('Error updating order and emptying Cart:', error);
              }
            );
          } else {
            console.error('User not found');
          }
        },
        (error) => {
          console.error('Error fetching user data:', error);
        }
      );
    } else {
      console.error('No user found in localStorage');
    }
  }

  downloadInvoice(grandOrder: any) {
    this.paymentService.generateInvoice(grandOrder).subscribe(
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

  closeModal() {
    this.showPaymentSuccessModal = false;
    this.router.navigate(['/orders']);
  }
}