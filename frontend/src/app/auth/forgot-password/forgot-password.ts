import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
  standalone: false
})
export class ForgotPasswordComponent implements OnInit {
  step: 'request' | 'reset' = 'request';
  requestForm!: FormGroup;
  resetForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  resetToken: string | null = null;
  isDialogMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Optional() private activatedRoute: ActivatedRoute | null,
    @Optional() private dialogRef: DynamicDialogRef | null,
    @Optional() private dialogConfig: DynamicDialogConfig | null
  ) {}

  ngOnInit(): void {
    this.isDialogMode = !!this.dialogConfig?.data?.asDialog;
    this.initializeForms();

    this.activatedRoute?.queryParams.subscribe(params => {
      if (params['token']) {
        this.resetToken = params['token'];
        this.step = 'reset';
      }
    });
  }

  private initializeForms(): void {
    this.requestForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get requestFormControls() {
    return this.requestForm.controls;
  }

  get resetFormControls() {
    return this.resetForm.controls;
  }

  onRequestSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.requestForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.forgotPassword({
      email: this.requestFormControls['email'].value
    }).subscribe({
      next: () => {
        this.successMessage = 'На вашу пошту надіслано повідомлення зі сторінкою для скидання пароля';
        this.requestForm.reset();
        this.submitted = false;
        this.loading = false;

        if (this.isDialogMode) {
          setTimeout(() => {
            this.dialogRef?.close({ backToLogin: true });
          }, 1500);
          return;
        }

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Помилка при запиті. Спробуйте ще раз.';
        this.loading = false;
      }
    });
  }

  onResetSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.resetForm.invalid || !this.resetToken) {
      return;
    }

    this.loading = true;

    this.authService.resetPassword({
      token: this.resetToken,
      password: this.resetFormControls['password'].value
    }).subscribe({
      next: () => {
        this.successMessage = 'Пароль успішно змінено! Перенаправлення до входу...';
        this.loading = false;

        if (this.isDialogMode) {
          setTimeout(() => {
            this.dialogRef?.close({ backToLogin: true });
          }, 1200);
          return;
        }

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Помилка при скиданні пароля. Спробуйте ще раз.';
        this.loading = false;
      }
    });
  }

  backToRequest(): void {
    this.step = 'request';
    this.resetToken = null;
    this.submitted = false;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeDialog(): void {
    if (this.isDialogMode) {
      this.dialogRef?.close({ backToLogin: true });
      return;
    }

    this.router.navigate(['/login']);
  }
}
