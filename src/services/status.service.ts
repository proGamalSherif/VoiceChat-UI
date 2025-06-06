import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private apiUrl=environment.apiUrl;
  constructor(private httpClient:HttpClient) { }
   GetUsersOnlineInRoom(roomId:number):Observable<any>{
    return this.httpClient.get(`${this.apiUrl}/UserStatus/${roomId}`);
  }
}
