import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl: string = 'https://67a648e2510789ef0dfaf592.mockapi.io/uday';
  private cartItemCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getCompleteUsersData(): Observable<any> {
    return this.http.get(this.baseUrl + '/users').pipe(
      catchError(this.handleError)
    );
  }

  postCompleteUserData(user: any): Observable<any> {
    return this.http.post(this.baseUrl + '/users', user).pipe(
      catchError(this.handleError)
    );
  }

  updatingUserData(user: any): Observable<any> {
    return this.http.put(this.baseUrl + '/users' + '/' + user.id, user).pipe(
      catchError(this.handleError)
    );
  }

  getCartItemCount(): Observable<number> {
    return this.cartItemCount.asObservable();
  }

  updateCartItemCount(count: number): void {
    this.cartItemCount.next(count);
  }

  private handleError(error: any) {
    console.error('Error occurred:', error);
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }
}