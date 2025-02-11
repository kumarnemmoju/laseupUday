import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  newAddressForm: FormGroup;
  currentUser: any = null;
  
  @Output() finalAddressToBePlaced = new EventEmitter<any>();

  constructor(
    private userService: UserService, 
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.newAddressForm = this.fb.group({
      street: ['', Validators.required],
      suite: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

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
            this.finalAddressToBePlaced.emit(this.defaultAddress);
          }
        }
      });
    }
  }

  setDefaultAddress(address: any) {
    this.defaultAddress = address;
    this.finalAddressToBePlaced.emit(this.defaultAddress);
    this.showSnackbar('Default address updated!');
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  addAddress() {
    if (this.newAddressForm.valid) {
      const newAddr = { ...this.newAddressForm.value };
      this.addresses.push(newAddr);
      this.defaultAddress = newAddr;
      this.newAddressForm.reset();
      this.showForm = false;

      if (this.currentUser) {
        this.currentUser.addresses = this.addresses;

        this.userService.updatingUserData(this.currentUser).subscribe((res) => {
          console.log('Address Updated Successfully', res);
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          this.showSnackbar('Address added successfully!');
          this.finalAddressToBePlaced.emit(this.defaultAddress);
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
      this.finalAddressToBePlaced.emit(this.defaultAddress);
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