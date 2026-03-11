import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-driver-application',
  templateUrl: './driver-application.html',
  styleUrls: ['./driver-application.scss'],
  standalone: false
})
export class DriverApplicationComponent implements OnInit {
  applicationForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.applicationForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,13}$/)]],
      licenseNumber: ['', Validators.required],
      carModel: ['', Validators.required],
      carYear: ['', [Validators.required, Validators.min(1990), Validators.max(new Date().getFullYear())]],
      carPlate: ['', Validators.required],
      carColor: ['', Validators.required]
    });
  }

  get f() {
    return this.applicationForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.applicationForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.applyForDriver(this.applicationForm.value).subscribe({
      next: () => {
        this.successMessage = 'Заявку успішно подано! Очікуйте на схвалення адміністратора.';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/map']);
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Помилка при подачі заявки';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/map']);
  }
}
