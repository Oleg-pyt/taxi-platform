import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../auth.service';
import { LoginComponent } from '../login/login';

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
  ) {}

  ngOnInit(): void {
    this.isDialogMode = !!this.dialogConfig?.data?.asDialog;
    this.continueOrderAfterRegister = !!this.dialogConfig?.data?.continueOrder;
    this.initializeForm();
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

  get f() {
    return this.registerForm.controls;
  }

  checkPasswordStrength(): void {
    const password = this.f['password'].value;
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    this.passwordStrength = (strength / 5) * 100;
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength === 0) return '';
    if (this.passwordStrength < 40) return 'Слабкий';
    if (this.passwordStrength < 70) return 'Середній';
    return 'Сильний';
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 40) return 'bg-red-500';
    if (this.passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  onSubmit(): void {
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

        this.successMessage = 'Реєстрація успішна! Перенаправлення на dashboard...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Помилка при реєстрації. Спробуйте ще раз.';
        this.loading = false;
      }
    });
  }

  registerWithGoogle(): void {
    console.log('Google registration not yet implemented');
    this.errorMessage = 'Google реєстрація ще не готова';
  }

  registerWithFacebook(): void {
    console.log('Facebook registration not yet implemented');
    this.errorMessage = 'Facebook реєстрація ще не готова';
  }

  openLogin(): void {
    if (this.isDialogMode) {
      const currentRef = this.dialogRef;
      const loginRef = this.dialogService.open(LoginComponent, {
        showHeader: false,
        width: '460px',
        modal: true,
        closable: false,
        dismissableMask: false,
        draggable: false,
        styleClass: 'auth-dialog',
        maskStyleClass: 'auth-dialog-mask',
        contentStyle: { overflow: 'hidden' },
        data: {
          asDialog: true,
          continueOrder: this.continueOrderAfterRegister
        }
      });
      if (!loginRef) {
        return;
      }

      setTimeout(() => currentRef?.close(), 0);
      return;
    }

    this.router.navigate(['/login']);
  }

}
