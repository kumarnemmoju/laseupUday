import { Component, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  allUsers: any[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private snackbar: MatSnackBar
  ) {
    this.signupForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        gender: ['', Validators.required],
        contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        email: ['', [Validators.required, Validators.email]],
        pass: ['', [Validators.required, Validators.minLength(6)]],
        password: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator.bind(this) }
    );
  }

  passwordMatchValidator(control: AbstractControl) {
    const pass = control.get('password')?.value;
    const password = control.get('password')?.value;
    if (pass !== password) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit() {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
      if (event.key === 'M' || event.key === 'm') {
        this.signupForm.get('gender')?.setValue('Male');
      } else if (event.key === 'F' || event.key === 'f') {
        this.signupForm.get('gender')?.setValue('Female');
      }
    }
  }

  onSubmit() {
    const enteredEmail = this.signupForm.value.email;

    // Check if user already exists
    this.userService.getCompleteUsersData().subscribe(
      (users: any[]) => {
        const userExists = users.some(user => user.email === enteredEmail);

        if (userExists) {
          // User already exists, show snackbar and redirect to signin
          this.snackbar.open('User already exists! Please sign in.', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/signin']);
        } else {
          // If user does not exist, proceed with signup
          let obj = {
            firstName: this.signupForm.value.firstName,
            lastName: this.signupForm.value.lastName,
            gender: this.signupForm.value.gender,
            contact: this.signupForm.value.contact,
            email: enteredEmail,
            password: this.signupForm.value.password,
            addresses: [],
            Cart: [],
            Wishlist: [],
            Orders: [],
          };

          this.userService.postCompleteUserData(obj).pipe(
            catchError((error) => {
              console.error('Error occurred:', error);
              this.snackbar.open('Something went wrong! Please try again.', 'Close', {
                duration: 3000,
              });
              return throwError(() => new Error('Signup failed'));
            })
          ).subscribe(
            (res) => {
              this.snackbar.open('Signup successful!', 'Close', {
                duration: 3000,
              });
              this.router.navigate(['/signin']);
            }
          );
        }
      },
      (error) => {
        console.error('Error fetching users:', error);
        this.snackbar.open('Failed to check user existence. Try again!', 'Close', {
          duration: 3000,
        });
      }
    );
  }
}