import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService,
  ) { }

  public ngOnInit(): void {
    this.initializeForm();
  }

  get f() {
    return this.loginForm.controls;
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login({
      email: this.f['email'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        this.router.navigate(['/order']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error during login. Please check your credentials.';
        this.loading = false;
      }
    });
  }

  public loginWithGoogle(): void {
    console.log('Google login not yet implemented');
    this.errorMessage = 'Google login not yet implemented';
  }

  public loginWithFacebook(): void {
    console.log('Facebook login not yet implemented');
    this.errorMessage = 'Facebook login not yet implemented';
  }

  public openRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  public openForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
}
