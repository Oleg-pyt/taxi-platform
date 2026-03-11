import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
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
  private userKey = 'currentUser';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiUsersService: ApiUsersService
  ) {
    this.loadUserFromStorage();
  }

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
        localStorage.setItem(this.userKey, JSON.stringify(user));
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
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/map']);
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
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Завантаження користувача з локального сховища
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson && this.hasValidToken()) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        localStorage.removeItem(this.userKey);
      }
    }
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
