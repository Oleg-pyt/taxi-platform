import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Rating {
  rideId: string;
  rating: number; // 1-5
  review?: string;
  ratedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = environment.apiUrl + '/rides';

  constructor(private http: HttpClient) {}

  /**
   * Оцінити завершену поїздку
   */
  submitRating(rideId: string, rating: number, review?: string): Observable<Rating> {
    return this.http.post<Rating>(`${this.apiUrl}/${rideId}/rate`, {
      rating: Math.min(5, Math.max(1, rating)), // 1-5
      review: review || ''
    });
  }

  /**
   * Отримати рейтинги користувача
   */
  getUserRatings(userId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/user/${userId}/ratings`);
  }

  /**
   * Отримати рейтинг конкретної поїздки
   */
  getRideRating(rideId: string): Observable<Rating | null> {
    return this.http.get<Rating | null>(`${this.apiUrl}/${rideId}/rating`);
  }
}
