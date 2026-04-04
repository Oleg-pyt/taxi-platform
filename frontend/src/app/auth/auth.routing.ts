import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout/auth-layout';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  }
];
