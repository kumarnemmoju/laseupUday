import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../auth.guard';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackbar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    const enteredEmail = this.loginForm.value.email;
    const enteredPassword = this.loginForm.value.password;

    this.userService.getCompleteUsersData().subscribe(
      (users: any[]) => {
        const user = users.find(u => u.email === enteredEmail);

        if (user) {
          if (user.password === enteredPassword) {
            // Store user details
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(user)); // Store user object
            this.authService.updateLoginStatus(true);

            this.snackbar.open(`Welcome, ${user.firstName}!`, 'Close', { duration: 3000 });
            this.router.navigate(['/home']); // Redirect to home page
          } else {
            this.snackbar.open('Incorrect password!', 'Close', { duration: 3000 });
          }
        } else {
          this.snackbar.open('User not found! Redirecting to signup...', 'Close', { duration: 3000 });
          this.router.navigate(['/signup']);
        }
      },
      (error) => {
        console.error('Error fetching users:', error);
        this.snackbar.open('Something went wrong! Try again.', 'Close', { duration: 3000 });
      }
    );
  }
}
