import { Component, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: false,
})
export class App implements OnInit {
  protected readonly title = signal('Taxi Platform');
  currentUser$: Observable<any>;
  isAuthenticated$: Observable<boolean>;
  shouldShowHeader$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    
    // Show header only on non-map pages
    this.shouldShowHeader$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: any) => {
        const url = event.urlAfterRedirects;
        // Hide header on map page
        return !url.includes('/map');
      })
    );
  }

  ngOnInit(): void {
    // Component initialization
  }

  openProfile(): void {
    this.dialogService.open(ProfileDialogComponent, {
      header: 'Профіль',
      width: '500px',
      modal: true,
      showHeader: true,
      styleClass: 'profile-dialog'
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
