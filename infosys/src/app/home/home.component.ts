import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isLoading = true;
  allUsers : any[]=[];
  products: any[] = [];
  filteredProducts: any[] = [];
  paginatedProducts: any[] = []; // Products to display on the current page
  currentPage: number = 1; // Current page number
  itemsPerPage: number = 8; // Number of items to display per page
  totalPages: number = 0; // Total number of pages

  // Filter options
  selectedSort: string = 'recent';
  selectedBrand: string = '';  // Single brand selection
  minPrice: number = 0;
  maxPrice: number = Infinity;
  selectedRating: number = 0;

  // Available filters
  uniqueBrands: string[] = [];
  ratings = [1, 2, 3, 4, 5];

  appliedFilters: string[] = [];

  constructor(private router:Router,private productService: ProductsService,private userService:UserService,private snackbar:MatSnackBar) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    this.productService.getAllProducts().subscribe((res: any) => {
      if (res && Array.isArray(res)) {
        this.products = res;
        this.filteredProducts = [...this.products];
        this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        this.updatePaginatedProducts(); // Initialize paginated products
      }
    });
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Update the paginated products based on the current page
  updatePaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  // Go to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }

  // Go to the previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }

  // Go to a specific page
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedProducts();
    }
  }

  applyFilters() {
    this.filteredProducts = [...this.products];
  
    // Sorting
    if (this.selectedSort === 'lowToHigh') {
      this.filteredProducts.sort((a, b) => (a?.currentPrice ?? 0) - (b?.currentPrice ?? 0));
    } else if (this.selectedSort === 'highToLow') {
      this.filteredProducts.sort((a, b) => (b?.currentPrice ?? 0) - (a?.currentPrice ?? 0));
    }
  
    // Brand Filter
    if (this.selectedBrand) {
      this.filteredProducts = this.filteredProducts.filter(p => (p?.brand ?? '') === this.selectedBrand);
    }
  
    // Price Filter
    this.filteredProducts = this.filteredProducts.filter(p => 
      (p?.currentPrice ?? 0) >= this.minPrice && (p?.currentPrice ?? 0) <= this.maxPrice
    );
  
    // Rating Filter
    if (this.selectedRating > 0) {
      this.filteredProducts = this.filteredProducts.filter(p => (p?.rating ?? 0) >= this.selectedRating);
    }
  
    // Update applied filters
    this.appliedFilters = [];
    if (this.selectedBrand) this.appliedFilters.push(`Brand: ${this.selectedBrand}`);
    if (this.minPrice > 0 || this.maxPrice < Infinity) this.appliedFilters.push(`Price: ₹${this.minPrice} - ₹${this.maxPrice}`);
    if (this.selectedRating > 0) this.appliedFilters.push(`Rating: ${this.selectedRating}+`);
  
    // Reset pagination
    this.currentPage = 1; // Reset to the first page
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage); // Recalculate total pages
    this.updatePaginatedProducts(); // Update paginated products
  }

  clearFilters() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
    this.selectedBrand = '';
    this.minPrice = 0;
    this.maxPrice = Infinity;
    this.selectedRating = 0;
    this.selectedSort = 'recent';
    this.applyFilters(); // This will reset the filters and update pagination
  }

  removeFilter(filter: string) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
    if (filter.includes('Brand:')) {
      this.selectedBrand = '';
    } else if (filter.includes('Price:')) {
      this.minPrice = 0;
      this.maxPrice = Infinity;
    } else if (filter.includes('Rating:')) {
      this.selectedRating = 0;
    }
    this.applyFilters(); // This will reset the filters and update pagination
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
              this.snackbar.open('Added Successfully!', 'Close', {
                duration: 3000,
              });

              // Calculate the total items in the cart and update UserService
              const totalItems = userDt.Cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
              this.userService.updateCartItemCount(totalItems); // Update cart item count
            });
          }
        }
      });
    } else {
      this.snackbar.open('Please Sign In!', 'Close', {
        duration: 3000,
      });
      this.router.navigate(['/signin']);
    }
  }
  
}
