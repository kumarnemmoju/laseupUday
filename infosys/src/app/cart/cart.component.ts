import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  isLoading = true;
  cartItems: any[] = [];
  allUsers: any[] = [];
  totalPrice = 0;
  totalGST = 0;
  totalDelivery = 0;
  grandTotal = 0;
  finalAddress: any;
  totalItemsInCart: any;
  orderDetails: any;

  constructor(private userService: UserService, private router: Router,private paymentService : PaymentService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  
 

  addToCart(product: any) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe((res: any) => {
        if (res) {
          this.allUsers = res;
          let userDt = this.allUsers.find((h) => h.id === userId);
  
          if (userDt) {
            // Create a deep copy of the product
            const productCopy = JSON.parse(JSON.stringify(product));
  
            let existingItem = userDt.Cart.find(
              (item: any) => item.productId === productCopy.productId
            );
  
            if (existingItem) {
              existingItem.quantity += 1;
            } else {
              userDt.Cart.push({ ...productCopy, quantity: 1 });
            }
  
            this.userService.updatingUserData(userDt).subscribe(() => {
              localStorage.setItem('user', JSON.stringify(userDt));
              this.cartItems = [...userDt.Cart];
              this.calculateTotals();
              this.calculateTotalItemsInCart();
            });
          }
        }
      });
    }
  }

  

  loadCart() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);

    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe((res: any) => {
        if (res) {
          this.allUsers = res;
          let userDt = this.allUsers.find((h) => h.id === userId);

          if (userDt) {
            this.cartItems = JSON.parse(JSON.stringify(userDt.Cart));
            this.calculateTotalItemsInCart(); // Calculate and update cart item count
            this.calculateTotals();
          }
        }
      });
    }
  }

  increaseQuantity(item: any) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);

    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe((res: any) => {
        if (res) {
          this.allUsers = res;
          let userDt = this.allUsers.find((h) => h.id === userId);

          if (userDt) {
            // Find the item in the cart
            const cartItem = userDt.Cart.find(
              (product: any) => product.productId === item.productId
            );

            if (cartItem) {
              // Increase the quantity
              cartItem.quantity++;

              // Update the user data on the server
              this.userService.updatingUserData(userDt).subscribe(() => {
                localStorage.setItem('user', JSON.stringify(userDt));

                // Update the local cartItems array
                const localCartItem = this.cartItems.find(
                  (product: any) => product.productId === item.productId
                );
                if (localCartItem) {
                  localCartItem.quantity++;
                }

                this.calculateTotals();
                this.calculateTotalItemsInCart();
              });
            }
          }
        }
      });
    }
  }

  decreaseQuantity(item: any) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);

    if (item.quantity > 1) {
      const user = localStorage.getItem('user');
      if (user) {
        const userId = JSON.parse(user).id;
        this.userService.getCompleteUsersData().subscribe((res: any) => {
          if (res) {
            this.allUsers = res;
            let userDt = this.allUsers.find((h) => h.id === userId);

            if (userDt) {
              // Find the item in the cart
              const cartItem = userDt.Cart.find(
                (product: any) => product.productId === item.productId
              );

              if (cartItem) {
                // Decrease the quantity
                cartItem.quantity--;

                // Update the user data on the server
                this.userService.updatingUserData(userDt).subscribe(() => {
                  localStorage.setItem('user', JSON.stringify(userDt));

                  // Update the local cartItems array
                  const localCartItem = this.cartItems.find(
                    (product: any) => product.productId === item.productId
                  );
                  if (localCartItem) {
                    localCartItem.quantity--;
                  }

                  this.calculateTotals();
                  this.calculateTotalItemsInCart();
                });
              }
            }
          }
        });
      }
    }
  }

  sumArray(numbers:any) {
    return numbers.reduce((sum:any, num:any) => sum + num, 0);
  }

  calculateTotalItemsInCart() {
    let arr: any[] = [];
    this.cartItems.forEach((h) => {
      arr.push(h.quantity);
    });
    this.totalItemsInCart = this.sumArray(arr);
    this.userService.updateCartItemCount(this.totalItemsInCart); // Notify UserService of cart changes
  }

  removeFromCart(productIdToRemove: any) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe((res) => {
        if (res) {
          this.allUsers = res;
          let userDt = this.allUsers.find((h: any) => h.id === userId);

          if (userDt) {
            userDt.Cart = userDt.Cart.filter(
              (product: any) => product.productId !== productIdToRemove
            );

            this.userService.updatingUserData(userDt).subscribe(() => {
              localStorage.setItem('user', JSON.stringify(userDt));
              this.cartItems = [...userDt.Cart];
              this.calculateTotals();
              this.calculateTotalItemsInCart();
            });
          }
        }
      });
    }
  }

  moveToWishlist(item: any) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe((res) => {
        if (res) {
          this.allUsers = res;
          let userDt = this.allUsers.find((h: any) => h.id === userId);

          if (userDt) {
            // Ensure Wishlist exists in user data
            if (!userDt.Wishlist) {
              userDt.Wishlist = [];
            }

            // Remove item from cart
            userDt.Cart = userDt.Cart.filter(
              (product: any) => product.productId !== item.productId
            );

            // Check if item already exists in wishlist
            let existingWishlistItem = userDt.Wishlist.find(
              (product: any) => product.productId === item.productId
            );

            if (!existingWishlistItem) {
              userDt.Wishlist.push(item);
            }

            // Update user data
            this.userService.updatingUserData(userDt).subscribe(() => {
              localStorage.setItem('user', JSON.stringify(userDt));
              this.cartItems = [...userDt.Cart];
              this.loadCart();
              this.calculateTotals();
              this.calculateTotalItemsInCart();
            });
          }
        }
      });
    }
  }

  clearCart() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe((res) => {
        if (res) {
          this.allUsers = res;
          let userDt = this.allUsers.find((h: any) => h.id === userId);

          if (userDt) {
            // Empty the cart
            userDt.Cart = [];

            // Update user data in the API
            this.userService.updatingUserData(userDt).subscribe(() => {
              localStorage.setItem('user', JSON.stringify(userDt));
              this.cartItems = [];
              this.loadCart();
              this.calculateTotals();
              this.calculateTotalItemsInCart();
            });
          }
        }
      });
    }
  }

  calculateTotals() {
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + item.currentPrice * item.quantity,
      0
    );
    this.totalGST = this.cartItems.reduce(
      (sum, item) => sum + item.gst * item.quantity,
      0
    );
    this.totalDelivery = this.cartItems.reduce(
      (sum, item) => sum + item.deliveryCharges,
      0
    );
    this.grandTotal = this.totalPrice + this.totalGST + this.totalDelivery;
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  getFinalAddressToBeDelivered(address: any) {
    this.finalAddress = address;
  
    // Update the orderDetails with the selected address
    if (this.orderDetails) {
      this.orderDetails.finalAddress = address;
    }
  }

  goToPayment() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe((res: any) => {
        if (res) {
          this.allUsers = res;
          let userDt = this.allUsers.find((h) => h.id === userId);
  
          if (userDt) {
            // Create the order details object
            const orderDetails = {
              cartItems: JSON.parse(JSON.stringify(this.cartItems)), // Deep copy of cart items
              totalItems: this.totalItemsInCart,
              grandTotal: this.totalPrice,
              totalGST: this.totalGST,
              finalAddress: this.finalAddress,
            };
  
            // Pass the order details to the payment component
            this.paymentService.setOrderDetails(orderDetails);
            this.router.navigate(['/payment']);
          }
        }
      });
    }
  }
}
