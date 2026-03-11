import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthService, User } from '../auth/auth.service';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { RideHistoryDialogComponent } from '../ride-history-dialog/ride-history-dialog.component';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.html',
  styleUrls: ['./user-menu.scss'],
  standalone: false
})
export class UserMenuComponent implements OnInit {
  isOpen = false;
  user: User | null = null;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  closeMenu(): void {
    this.isOpen = false;
  }

  get isDriver(): boolean {
    return this.authService.isDriver();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get canApplyForDriver(): boolean {
    return this.isAuthenticated && !this.user?.isDriver;
  }

  get isAwaitingDriverApproval(): boolean {
    return this.user?.isDriver === true && this.user?.driverApproved === false;
  }

  goToLogin(): void {
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.closeMenu();
    this.router.navigate(['/register']);
  }

  openRideHistoryDialog(): void {
    this.closeMenu();
    this.dialogService.open(RideHistoryDialogComponent, {
      header: 'Історія поїздок',
      width: '600px',
      modal: true,
      showHeader: true,
      styleClass: 'ride-history-dialog'
    });
  }

  goToDriverApplication(): void {
    this.closeMenu();
    this.router.navigate(['/driver-application']);
  }

  goToDriverPanel(): void {
    this.closeMenu();
    this.router.navigate(['/driver-panel']);
  }

  goToAdminPanel(): void {
    this.closeMenu();
    this.router.navigate(['/admin-panel']);
  }

  openProfileDialog(): void {
    this.closeMenu();
    this.dialogService.open(ProfileDialogComponent, {
      header: this.isDriver ? 'Профіль водія' : 'Профіль',
      width: '500px',
      modal: true,
      showHeader: true,
      styleClass: 'profile-dialog'
    });
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }

  getInitials(): string {
    if (!this.user?.name) return 'U';
    const names = this.user.name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return this.user.name[0];
  }
}
