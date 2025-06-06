import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRAudioService {
  private hubConnection!: signalR.HubConnection;

  constructor() {}

  public startConnection(userId: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/callhub?userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ SignalR connection started'))
      .catch((err) =>
        console.error('❌ Error while starting SignalR connection:', err)
      );
  }

  public onReceiveCall(callback: (callerId: string) => void): void {
    this.hubConnection.on('ReceiveCall', callback);
  }

  public onReceiveOffer(
    callback: (senderId: string, offer: any) => void
  ): void {
    this.hubConnection.on('ReceiveOffer', callback);
  }

  public onReceiveAnswer(
    callback: (senderId: string, answer: any) => void
  ): void {
    this.hubConnection.on('ReceiveAnswer', callback);
  }

  public onReceiveIceCandidate(
    callback: (senderId: string, candidate: any) => void
  ): void {
    this.hubConnection.on('ReceiveIceCandidate', callback);
  }

  public onReceiveCallEnded(callback: (senderId: string) => void): void {
    this.hubConnection.on('ReceiveCallEnded', callback);
  }

  public startCall(receiverId: string, callerId: string,roomId:number): Promise<void> {
    return this.hubConnection.invoke('StartCall', receiverId, callerId,roomId);
  }

  public sendOffer(
    receiverId: string,
    senderId: string,
    offer: any
  ): Promise<void> {
    return this.hubConnection.invoke('SendOffer', receiverId, senderId, offer);
  }

  public sendAnswer(
    receiverId: string,
    senderId: string,
    answer: any
  ): Promise<void> {
    return this.hubConnection.invoke(
      'SendAnswer',
      receiverId,
      senderId,
      answer
    );
  }

  public sendIceCandidate(
    receiverId: string,
    senderId: string,
    candidate: any
  ): Promise<void> {
    return this.hubConnection.invoke(
      'SendIceCandidate',
      receiverId,
      senderId,
      candidate
    );
  }

  public endVoiceCall(receiverId: string, senderId: string): Promise<void> {
    return this.hubConnection.invoke('EndCall', receiverId, senderId);
  }
  public disconnect(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => {
        console.log('SignalR connection stopped');
      });
    }
  }
}
