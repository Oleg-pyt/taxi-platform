import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { AuthLayoutComponent } from './auth-layout/auth-layout';
import { AppCommonModule } from '../common/common.module';
import { authRoutes } from './auth.routing';

@NgModule({
    declarations: [
        LoginComponent,
        RegisterComponent,
        ForgotPasswordComponent,
        AuthLayoutComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forChild(authRoutes),
        DynamicDialogModule,
        AppCommonModule
    ],
    exports: [
        LoginComponent,
        RegisterComponent,
        ForgotPasswordComponent,
        AuthLayoutComponent
    ]
})
export class AuthModule { }
