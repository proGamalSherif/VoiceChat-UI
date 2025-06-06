import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  constructor(private httpClient:HttpClient) { }
   InsertEntity(entity:FormData):Observable<any>{
    return this.httpClient.post<any>(`${this.apiUrl}/ApplicationUser`,entity);
  }
}
