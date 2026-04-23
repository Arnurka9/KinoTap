import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.api}/register/`, data);
  }

  login(data: any) {
    return this.http.post<any>(`${this.api}/login/`, data);
  }
}
