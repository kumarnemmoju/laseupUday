import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { AuthService } from './auth.guard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Footwear E-Commerce';
  isCredentailsAvailable = false;
  userName: string | null = null;
  cartItemCount: number = 0;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isCredentailsAvailable = status;
      this.userName = this.authService.getUserName();
      if (status) {
        this.loadCart();
      }
    });

    // Subscribe to cart item count updates
    this.userService.getCartItemCount().subscribe((count) => {
      this.cartItemCount = count;
    });
  }

  loadCart() {
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      this.userService.getCompleteUsersData().subscribe((res: any) => {
        if (res) {
          const userDt = res.find((h: any) => h.id === userId);
          if (userDt && userDt.Cart) {
            const count = userDt.Cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
            this.userService.updateCartItemCount(count); // Initialize cart item count
          }
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    location.reload();
  }
}