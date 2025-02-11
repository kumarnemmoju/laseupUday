import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit {
  wishlistItems: any[] = [];
  allUsers: any[] = [];
  isLoading = true;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist() {
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
            this.wishlistItems = userDt.Wishlist;
          }
        }
      });
    }
  }

  removeFromWishlist(productIdToRemove: any) {
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
            userDt.Wishlist = userDt.Wishlist.filter((product: any) => product.productId !== productIdToRemove);

            this.userService.updatingUserData(userDt).subscribe(() => {
              localStorage.setItem('user', JSON.stringify(userDt));
              this.wishlistItems = [...userDt.Wishlist];
            });
          }
        }
      });
    }
  }

  moveToCart(item: any) {
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
            // Remove item from wishlist
            userDt.Wishlist = userDt.Wishlist.filter((product: any) => product.productId !== item.productId);

            // Add item to cart
            const existingCartItem = userDt.Cart.find((cartItem: any) => cartItem.productId === item.productId);
            if (existingCartItem) {
              existingCartItem.quantity += 1; // Increase quantity if item already exists in cart
            } else {
              userDt.Cart.push({ ...item, quantity: 1 }); // Add new item to cart
            }

            // Update user data
            this.userService.updatingUserData(userDt).subscribe(() => {
              localStorage.setItem('user', JSON.stringify(userDt));
              this.wishlistItems = [...userDt.Wishlist];

              // Calculate the total items in the cart and update UserService
              const totalItems = userDt.Cart.reduce((sum: number, cartItem: any) => sum + cartItem.quantity, 0);
              this.userService.updateCartItemCount(totalItems); // Update cart item count
            });
          }
        }
      });
    }
  }

  goToHome() {
    this.router.navigate(['/home']); // Navigate to the home page
  }
}