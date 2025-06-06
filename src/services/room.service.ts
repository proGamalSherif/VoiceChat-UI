import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignalRService } from './signal-r.service';
import { IInsertRoomChatDTO } from '../models/iinsert-room-chat-dto';
import { IRoomChat } from '../models/iroom-chat';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private apiUrl = environment.apiUrl;

  constructor(
    private httpClient: HttpClient,
    private signalRService: SignalRService
  ) {
    this.signalRService.startConnection();
  }

  // الطرق الحالية للغرف
  GetAllAsync(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/Room`);
  }

  GetByIdAsync(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/Room/${id}`);
  }

  InsertEntity(entity: FormData): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/Room`, entity);
  }

  InsertRoomWithUser(userId: string | null, entity: FormData): Observable<any> {
    return this.httpClient.post(
      `${this.apiUrl}/Room/InsertRoomWithUser/${userId}`,
      entity
    );
  }

  PostNewMessage(entity: FormData): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/RoomChat`, entity);
  }
  InsertEntityConnection(entity: FormData): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/UserConnection`, entity);
  }
  // طرق جديدة للدردشة
  public joinRoom(roomId: number): Promise<void> {
    return this.signalRService.joinRoom(roomId);
  }

  public async sendChatMessage(
    message: IInsertRoomChatDTO
  ): Promise<IRoomChat> {
    return this.signalRService.sendMessage(message);
  }

  public getMessageStream(): Observable<IRoomChat> {
    return this.signalRService.messageReceived$;
  }

  public getConnectionStatus(): Observable<boolean> {
    return this.signalRService.connectionStatus$;
  }
}
