import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService, User, UserRole } from '../auth/auth.service';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss'],
  standalone: false
})
export class ProfileDialogComponent implements OnInit {
  user: any;
  isDriver = false;
  passwordForm!: FormGroup;
  showPasswordForm = false;
  passwordChangeLoading = false;
  passwordChangeMessage: { type: 'success' | 'error'; text: string } | null = null;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    public dialogRef: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.initPasswordForm();
  }

  private loadUserProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.isDriver = user?.isDriver || user?.roles?.includes(UserRole.DRIVER) || false;
    });
  }

  private initPasswordForm(): void {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
      this.passwordChangeMessage = null;
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.passwordChangeLoading = true;
    this.passwordChangeMessage = null;

    // TODO: Call API to change password
    // For now, simulating the call
    setTimeout(() => {
      this.passwordChangeLoading = false;
      this.passwordChangeMessage = {
        type: 'success',
        text: 'Пароль успішно змінено'
      };
      this.passwordForm.reset();
      setTimeout(() => {
        this.showPasswordForm = false;
        this.passwordChangeMessage = null;
      }, 2000);
    }, 500);
  }

  getRoleLabel(role: string): string {
    const roleMap: { [key: string]: string } = {
      'PASSENGER': 'Пасажир',
      'DRIVER': 'Водій',
      'ADMIN': 'Адміністратор'
    };
    return roleMap[role] || role;
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'COMPLETED' || status === 'true') {
      return 'badge-success';
    } else if (status === 'CANCELLED' || status === 'false') {
      return 'badge-danger';
    }
    return 'badge-info';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
