import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppService {
  constructor(private readonly http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  search(search_query: string) {
    const params = new HttpParams().set('query', search_query);
    return fetch('../assets/search.json').then(async res => res = await res.json());
    return this.http
      .get('http://localhost:3000/search', {params})
      .pipe(catchError(this.handleError));
  }
}
