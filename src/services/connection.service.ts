import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private apiUrl=environment.apiUrl;
  constructor(private httpClient:HttpClient) { }
   GetAllByUserId(userId:string | null):Observable<any>{
    return this.httpClient.get<any>(`${this.apiUrl}/UserConnection/GetByUserId/${userId}`);
  }
  InsertEntity(entity:FormData):Observable<any>{
    return this.httpClient.post(`${this.apiUrl}/UserConnection`,entity);
  }
}
