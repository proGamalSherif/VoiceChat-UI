import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';
import { IRoomChat } from '../models/iroom-chat';
import { IInsertRoomChatDTO } from '../models/iinsert-room-chat-dto';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  public connectionStatus$ = new BehaviorSubject<boolean>(false);
  public messageReceived$ = new Subject<IRoomChat>();
  constructor() { }
  public startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/chathub`)
      .withAutomaticReconnect()
      .build();
    
    return this.hubConnection.start()
      .then(() => {
        this.connectionStatus$.next(true);
        this.registerListeners();
      })
      .catch(err => {
        this.connectionStatus$.next(false);
        throw err;
      });
  }
  private registerListeners(): void {
    this.hubConnection.on('ReceiveMessage', (data: IRoomChat) => {
      this.messageReceived$.next(data);
    });
  }
  public joinRoom(roomId: number): Promise<void> {
    return this.hubConnection.invoke('JoinRoom', roomId)
      .catch(err => {
        throw err;
      });
  }
  public sendMessage(message: IInsertRoomChatDTO): Promise<IRoomChat> {
    return this.hubConnection.invoke('SendMessage', message)
      .then(() => {
        return new Promise<IRoomChat>((resolve) => {
          const sub = this.messageReceived$.subscribe((receivedMessage) => {
            if (receivedMessage.roomId === message.roomId) {
              sub.unsubscribe();
              resolve(receivedMessage);
            }
          });
        });
      })
      .catch(err => {
        throw err;
      });
  }
  public disconnect(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          this.connectionStatus$.next(false);
        });
    }
  }
}