import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RoomService } from '../../services/room.service';
import { IRoom } from '../../models/iroom';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormatDateTimePipe } from '../../pipes/pipes/format-date-time.pipe';
import { Subscription } from 'rxjs';
import { IInsertRoomChatDTO } from '../../models/iinsert-room-chat-dto';
import { AlertService } from '../../services/alert.service';
import { StatusService } from '../../services/status.service';
import { IStatus } from '../../models/istatus';
import { SignalRAudioService } from '../../services/signal-raudio.service';
declare var bootstrap: any;
@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormatDateTimePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  @ViewChild('localAudio') localAudio!: ElementRef;
  @ViewChild('remoteAudio') remoteAudio!: ElementRef;
  @ViewChild('inputMessage') inputMessageRef!: ElementRef;
  @ViewChild('modalElement') modalElement!: ElementRef;
  @Input() RoomId!: number;
  private messageSub!: Subscription;
  RoomEntity!: IRoom;
  LoggedUser!: string | null;
  UsersOnline!: number;
  UsersOnlineArr!: IStatus[];
  activeCallUserId: string | null = null;
  private peerConnection!: RTCPeerConnection;
  private localStream!: MediaStream;
  private remoteStream!: MediaStream;
  private loggedUserId!: string;
  private selectedUserId: string = '';

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private alertService: AlertService,
    private statusService: StatusService,
    private signalRAudio: SignalRAudioService
  ) {
    this.authService.userId$.subscribe((id) => {
      this.LoggedUser = id;
      this.loggedUserId = id ?? '';
    });
  }
  ngOnInit(): void {
    if (this.RoomId) {
      this.roomService.GetByIdAsync(this.RoomId).subscribe({
        next: (res) => {
          this.RoomEntity = res.data;
          this.joinRoom(this.RoomId);
          this.messageSub = this.roomService
            .getMessageStream()
            .subscribe((message) => {
              this.RoomEntity.roomChats.push(message);
            });
          this.statusService.GetUsersOnlineInRoom(this.RoomId).subscribe({
            next: (res) => {
              this.UsersOnline = res.data.length;
              this.UsersOnlineArr = res.data;
            },
            error: (err) => {
              console.log('No Active Users');
            },
          });
          this.signalRAudio.startConnection(this.loggedUserId);
          this.signalRAudio.onReceiveCall((callerId: string) => {
            this.selectedUserId = callerId;
            this.startCall(false);
          });
          this.signalRAudio.onReceiveOffer(
            async (senderId: string, offer: any) => {
              await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(offer)
              );
              const answer = await this.peerConnection.createAnswer();
              await this.peerConnection.setLocalDescription(answer);
              this.signalRAudio.sendAnswer(senderId, this.loggedUserId, answer);
            }
          );
          this.signalRAudio.onReceiveAnswer(
            async (senderId: string, answer: any) => {
              await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(answer)
              );
            }
          );

          this.signalRAudio.onReceiveIceCandidate(
            async (senderId: string, candidate: any) => {
              if (candidate) {
                await this.peerConnection.addIceCandidate(
                  new RTCIceCandidate(candidate)
                );
              }
            }
          );
        },
      });
    }
  }
  joinRoom(roomId: number): void {
    this.roomService
      .joinRoom(roomId)
      .then()
      .catch((err) => console.error('Error joining room:', err));
  }
  onSubmit() {
    const nesMessage = new FormData();
    nesMessage.append('chatMessage', this.inputMessageRef.nativeElement.value);
    nesMessage.append('userId', this.LoggedUser ?? '');
    nesMessage.append('roomId', this.RoomId.toString());
    this.roomService.PostNewMessage(nesMessage).subscribe({
      next: () => {
        this.inputMessageRef.nativeElement.value = '';
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  sendMessage(message: string): void {
    const entity: IInsertRoomChatDTO = {
      userId: this.LoggedUser ?? '',
      roomId: this.RoomId,
      chatMessage: message,
    };
    this.roomService
      .sendChatMessage(entity)
      .then()
      .catch((err) => {
        this.alertService.failure(err);
      });
  }
  ngOnDestroy(): void {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
    }
  }
  ShowOnlineUsers() {
    const modal = new bootstrap.Modal(this.modalElement.nativeElement);
    modal.show();
  }
  async initiateCall(receiverId: string): Promise<void> {
    this.selectedUserId = receiverId;
    this.activeCallUserId = receiverId;
    this.signalRAudio.startCall(receiverId, this.loggedUserId);
    await this.startCall(true);
  }
  private async startCall(isCaller: boolean): Promise<void> {
    try {
      if (this.peerConnection) {
        this.peerConnection.close();
      }

      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: { exact: true },
        noiseSuppression: { exact: true },
        autoGainControl: { exact: true },
        channelCount: 1,
        sampleRate: 16000,
        sampleSize: 16,
      };
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.signalRAudio.sendIceCandidate(
            this.selectedUserId,
            this.loggedUserId,
            event.candidate
          );
        }
      };

      this.peerConnection.ontrack = (event) => {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
          this.remoteAudio.nativeElement.srcObject = this.remoteStream;
        }
        this.remoteStream.addTrack(event.track);
      };

      this.localStream = await this.applyAudioProcessing(
        await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: false,
        })
      );
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
      this.localAudio.nativeElement.srcObject = this.localStream;

      if (isCaller) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.signalRAudio.sendOffer(
          this.selectedUserId,
          this.loggedUserId,
          offer
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
  endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
    }

    this.signalRAudio.endVoiceCall(this.selectedUserId, this.loggedUserId);
    this.activeCallUserId = null;
    this.selectedUserId = '';

    // إعادة تعيين عناصر الصوت
    if (this.localAudio) {
      this.localAudio.nativeElement.srcObject = null;
    }
    if (this.remoteAudio) {
      this.remoteAudio.nativeElement.srcObject = null;
    }
  }
  private async applyAudioProcessing(
    stream: MediaStream
  ): Promise<MediaStream> {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const destination = audioContext.createMediaStreamDestination();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.8;
      source.connect(gainNode);
      gainNode.connect(destination);
      return new MediaStream([destination.stream.getAudioTracks()[0]]);
    } catch (error) {
      console.error('Error applying audio processing:', error);
      return stream;
    }
  }
}
