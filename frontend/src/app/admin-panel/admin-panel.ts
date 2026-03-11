import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService, User } from '../auth/auth.service';
import { RootState } from '../store/root.state';
import * as AdminActions from '../store/admin/admin.actions';
import * as AdminSelectors from '../store/admin/admin.selectors';
import { DriverApplication, RideStats } from '../store/admin/admin.state';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.scss'],
  standalone: false
})
export class AdminPanelComponent implements OnInit {
  activeTab: 'applications' | 'users' | 'rides' | 'stats' = 'applications';
  driverApplications: DriverApplication[] = [];
  users: User[] = [];
  stats: RideStats | null = null;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private store: Store<RootState>,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Перевірка чи користувач є адміном
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/map']);
      return;
    }

    this.store.select(AdminSelectors.selectAdminApplications).subscribe((applications) => {
      this.driverApplications = applications;
    });
    this.store.select(AdminSelectors.selectAdminUsers).subscribe((users) => {
      this.users = users;
    });
    this.store.select(AdminSelectors.selectAdminStats).subscribe((stats) => {
      this.stats = stats;
    });
    this.store.select(AdminSelectors.selectAdminLoading).subscribe((loading) => {
      console.log(loading);
      this.loading = loading;
    });
    this.store.select(AdminSelectors.selectAdminError).subscribe((error) => {
      this.errorMessage = error;
    });

    this.loadData();
  }

  loadData(): void {
    if (this.activeTab === 'applications') {
      this.store.dispatch(AdminActions.loadApplications());
    } else if (this.activeTab === 'users') {
      this.store.dispatch(AdminActions.loadUsers());
    } else if (this.activeTab === 'stats') {
      this.store.dispatch(AdminActions.loadStats());
    }
  }

  changeTab(tab: 'applications' | 'users' | 'rides' | 'stats'): void {
    this.activeTab = tab;
    this.loadData();
  }

  approveApplication(applicationId: string): void {
    if (!confirm('Схвалити заявку водія?')) return;
    this.store.dispatch(AdminActions.approveApplication({ applicationId }));
  }

  rejectApplication(applicationId: string): void {
    if (!confirm('Відхилити заявку водія?')) return;
    this.store.dispatch(AdminActions.rejectApplication({ applicationId }));
  }

  blockUser(userId: string): void {
    if (!confirm('Заблокувати користувача?')) return;
    this.store.dispatch(AdminActions.blockUser({ userId }));
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Очікує',
      'APPROVED': 'Схвалено',
      'REJECTED': 'Відхилено'
    };
    return statusMap[status] || status;
  }
}
