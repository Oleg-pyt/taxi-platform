import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  passwordStrength = 0;
  isDialogMode = false;
  continueOrderAfterRegister = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService,
    @Optional() private dialogRef: DynamicDialogRef | null,
    @Optional() private dialogConfig: DynamicDialogConfig | null
  ) { }

  public ngOnInit(): void {
    this.isDialogMode = !!this.dialogConfig?.data?.asDialog;
    this.continueOrderAfterRegister = !!this.dialogConfig?.data?.continueOrder;
    this.initializeForm();
  }

  get f() {
    return this.registerForm.controls;
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.register({
      email: this.f['email'].value,
      username: this.f['name'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        if (this.isDialogMode) {
          this.dialogRef?.close({
            authenticated: true,
            continueOrder: this.continueOrderAfterRegister
          });
          return;
        }

        this.successMessage = 'Registration successful! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error during registration. Please try again.';
        this.loading = false;
      }
    });
  }

  public registerWithGoogle(): void {
    console.log('Google registration not yet implemented');
    this.errorMessage = 'Google registration not yet implemented';
  }

  public registerWithFacebook(): void {
    console.log('Facebook registration not yet implemented');
    this.errorMessage = 'Facebook registration not yet implemented';
  }

  public openLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
