import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { RegisterComponent } from '../register/register';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password';
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
  isDialogMode = false;
  continueOrderAfterLogin = false;

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
    this.continueOrderAfterLogin = !!this.dialogConfig?.data?.continueOrder;
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
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
        if (this.isDialogMode) {
          this.dialogRef?.close({
            authenticated: true,
            continueOrder: this.continueOrderAfterLogin
          });
          return;
        }
        this.router.navigate(['/map']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Помилка при вході. Перевірте дані.';
        this.loading = false;
      }
    });
  }

  loginWithGoogle(): void {
    console.log('Google login not yet implemented');
    this.errorMessage = 'Google вхід ще не готовий';
  }

  loginWithFacebook(): void {
    console.log('Facebook login not yet implemented');
    this.errorMessage = 'Facebook вхід ще не готовий';
  }

  openRegister(): void {
    if (this.isDialogMode) {
      const currentRef = this.dialogRef;
      const registerRef = this.dialogService.open(RegisterComponent, {
        showHeader: false,
        width: '520px',
        modal: true,
        closable: false,
        dismissableMask: false,
        draggable: false,
        styleClass: 'auth-dialog',
        maskStyleClass: 'auth-dialog-mask',
        contentStyle: { overflow: 'hidden' },
        data: {
          asDialog: true,
          continueOrder: this.continueOrderAfterLogin
        }
      });
      if (!registerRef) {
        return;
      }

      setTimeout(() => currentRef?.close(), 0);

      registerRef.onClose.subscribe((result?: { authenticated?: boolean; continueOrder?: boolean }) => {
        if (!result?.authenticated) {
          this.dialogService.open(LoginComponent, {
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
              continueOrder: this.continueOrderAfterLogin
            }
          });
        }
      });
      return;
    }

    this.router.navigate(['/register']);
  }

  openForgotPassword(): void {
    if (this.isDialogMode) {
      const currentRef = this.dialogRef;
      const forgotRef = this.dialogService.open(ForgotPasswordComponent, {
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
          continueOrder: this.continueOrderAfterLogin
        }
      });

      setTimeout(() => currentRef?.close(), 0);

      forgotRef?.onClose.subscribe((result?: { backToLogin?: boolean }) => {
        if (result?.backToLogin !== false) {
          this.dialogService.open(LoginComponent, {
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
              continueOrder: this.continueOrderAfterLogin
            }
          });
        }
      });
      return;
    }

    this.dialogService.open(ForgotPasswordComponent, {
      showHeader: false,
      width: '460px',
      modal: true,
      closable: false,
      dismissableMask: false,
      draggable: false,
      styleClass: 'auth-dialog',
      maskStyleClass: 'auth-dialog-mask',
      contentStyle: { overflow: 'hidden' },
      data: { asDialog: true, continueOrder: false }
    });
  }

}

