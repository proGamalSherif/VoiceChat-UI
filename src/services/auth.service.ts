import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USER_ID_KEY = 'userId';
  private userIdSubject: BehaviorSubject<string | null>;
  constructor() {
    const storedUserId = localStorage.getItem(this.USER_ID_KEY);
    this.userIdSubject = new BehaviorSubject<string | null>(storedUserId);
  }
  get userId$(): Observable<string | null> {
    return this.userIdSubject.asObservable();
  }
  setUserId(userId: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
    this.userIdSubject.next(userId);
  }
  clearUserId(): void {
    localStorage.removeItem(this.USER_ID_KEY);
    this.userIdSubject.next(null);
  }
}
