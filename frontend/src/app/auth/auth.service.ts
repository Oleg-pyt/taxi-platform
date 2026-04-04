import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map, finalize, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { UsersService as ApiUsersService } from '@benatti/api';

export enum UserRole {
  PASSENGER = 'PASSENGER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roles: UserRole[];
  isDriver: boolean;
  driverApproved?: boolean;
  profilePhoto?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DriverApplicationRequest {
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
  carModel: string;
  carYear: number;
  carPlate: string;
  carColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/users';
  private tokenKey = 'authToken';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private sessionHydration$?: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private apiUsersService: ApiUsersService
  ) {}

  /**
   * Реєстрація нового користувача
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.apiUsersService.registerUser({
      email: data.email,
      username: data.username,
      password: data.password
    }).pipe(
      map((response) => ({
        token: response.token,
        user: this.toUser(response.user)
      })),
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Вхід користувача
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.apiUsersService.loginUser({
      email: data.email,
      password: data.password
    }).pipe(
      map((response) => ({
        token: response.token,
        user: this.toUser(response.user)
      })),
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Зміна пароля
   */
  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.apiUsersService.changePassword(data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Заявка на стати водієм
   */
  applyForDriver(data: DriverApplicationRequest): Observable<any> {
    return this.apiUsersService.applyDriver(data).pipe(
      tap(() => {
        // Оновити інформацію користувача
        this.refreshUserInfo().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Оновлення інформації користувача
   */
  refreshUserInfo(): Observable<User> {
    return this.apiUsersService.getCurrentUser().pipe(
      map((user) => this.toUser(user)),
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Оновлення токена (refresh token)
   */
  refreshToken(): Observable<{ token: string }> {
    const currentToken = this.getToken();
    return this.apiUsersService.refreshToken({ token: currentToken ?? '' }).pipe(
      map((response) => ({ token: response.token })),
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Запит на відновлення пароля
   */
  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Скидання пароля за допомогою токена
   */
  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Вихід користувача
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    window.location.replace('/auth/login');
  }

  logoutAndReload(): void {
    this.clearSessionState();
    window.location.href = '/auth/login';
  }

  clearSession(): void {
    this.clearSessionState();
  }

  ensureSessionLoaded(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      this.clearSessionState();
      return of(true);
    }

    if (!this.isTokenValid()) {
      this.clearSessionState();
      return of(false);
    }

    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      this.isAuthenticatedSubject.next(true);
      return of(true);
    }

    if (this.sessionHydration$) {
      return this.sessionHydration$;
    }

    this.isAuthenticatedSubject.next(true);
    this.sessionHydration$ = this.apiUsersService.getCurrentUser().pipe(
      map((user) => this.toUser(user)),
      tap((user) => {
        this.currentUserSubject.next(user);
      }),
      map(() => true),
      catchError(() => {
        this.clearSessionState();
        return of(false);
      }),
      finalize(() => {
        this.sessionHydration$ = undefined;
      }),
      shareReplay(1)
    );

    return this.sessionHydration$;
  }

  /**
   * Отримання токена
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Отримання поточного користувача
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Перевірка чи користувач має певну роль
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) || false;
  }

  /**
   * Перевірка чи користувач є водієм
   */
  isDriver(): boolean {
    return this.hasRole(UserRole.DRIVER);
  }

  /**
   * Перевірка чи користувач є адміністратором
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Перевірка чи токен ще дійсний
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    try {
      // Декодуємо JWT токен
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // exp в секундах
      return Date.now() < expirationTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Перевірка наявності валідного токена
   */
  hasValidToken(): boolean {
    return this.isTokenValid();
  }

  /**
   * Обробка успішної авторизації
   */
  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearSessionState(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Обробка помилок
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Сталася невідома помилка';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.statusText;
    }

    console.error('Auth error:', error);
    return throwError(() => new Error(errorMessage));
  }

  private toUser(user: {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    roles: string[];
    isDriver: boolean;
    driverApproved?: boolean | null;
    profilePhoto?: string | null;
  }): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone ?? undefined,
      roles: user.roles as UserRole[],
      isDriver: user.isDriver,
      driverApproved: user.driverApproved ?? undefined,
      profilePhoto: user.profilePhoto ?? undefined
    };
  }
}
