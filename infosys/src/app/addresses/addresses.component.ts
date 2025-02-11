import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.css'],
})
export class AddressesComponent implements OnInit {
  addresses: any[] = [];
  defaultAddress: any = null;
  allUsers: any[] = [];
  showForm: boolean = false;
  newAddress = { street: '', suite: '', city: '', state: '', country: '' };
  currentUser: any = null;
  
  @Output() finalAddressToBePlaced = new EventEmitter<any>();

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadAddresses();
  }
  

  loadAddresses() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.userService.getCompleteUsersData().subscribe((res: any) => {
        if (res) {
          this.allUsers = res;
          let userDt = this.allUsers.find((h) => h.id === this.currentUser.id);

          if (userDt && userDt.addresses.length > 0) {
            this.addresses = userDt.addresses;
            this.defaultAddress = userDt.addresses[userDt.addresses.length - 1]; 
            console.log('this.defaultAddress : ', this.defaultAddress);
            
            // Emit the default address after fetching it
            this.finalAddressToBePlaced.emit(this.defaultAddress);
          }
        }
      });
    }
  }

  setDefaultAddress(address: any) {
    this.defaultAddress = address;
    this.finalAddressToBePlaced.emit(this.defaultAddress);  // ✅ Emit when address changes
    this.showSnackbar('Default address updated!');
  }

  toggleForm() {

    this.showForm = !this.showForm;
  }

  addAddress() {
    if (
      this.newAddress.street &&
      this.newAddress.city &&
      this.newAddress.state &&
      this.newAddress.country
    ) {
      const newAddr = { ...this.newAddress };
      this.addresses.push(newAddr);
      this.defaultAddress = newAddr;
      this.newAddress = { street: '', suite: '', city: '', state: '', country: '' };
      this.showForm = false;

      if (this.currentUser) {
        this.currentUser.addresses = this.addresses;

        this.userService.updatingUserData(this.currentUser).subscribe((res) => {
          console.log('Address Updated Successfully', res);
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          this.showSnackbar('Address added successfully!');
          
          // Emit new default address
          this.finalAddressToBePlaced.emit(this.defaultAddress);  // ✅ Emit when a new address is added
        });
      }
    } else {
      this.showSnackbar('Please fill in all required fields.', 'error');
    }
  }

  removeAddress(address: any) {
    this.addresses = this.addresses.filter((addr) => addr !== address);

    if (this.defaultAddress === address) {
      this.defaultAddress = this.addresses.length > 0 ? this.addresses[this.addresses.length - 1] : null;
      this.finalAddressToBePlaced.emit(this.defaultAddress);  // ✅ Emit when address is removed
    }

    if (this.currentUser) {
      this.currentUser.addresses = this.addresses;

      this.userService.updatingUserData(this.currentUser).subscribe((res) => {
        console.log('Address Removed Successfully', res);
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        this.showSnackbar('Address removed successfully!');
      });
    }
  }

  private showSnackbar(message: string, type: string = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000
    });
  }
}
