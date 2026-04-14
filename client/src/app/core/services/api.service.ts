import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(url: string, params?: any) {
    return this.http.get<T>(`${this.baseUrl}${url}`, { params, withCredentials: true });
  }

  post<T>(url: string, body: any) {
    return this.http.post<T>(`${this.baseUrl}${url}`, body, { withCredentials: true });
  }

  patch<T>(url: string, body: any) {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body, { withCredentials: true });
  }
}
