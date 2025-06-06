import {
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsComponent } from '../rooms/rooms.component';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { RoomService } from '../../services/room.service';
import { ChatComponent } from "../chat/chat.component";
import { ConnectionService } from '../../services/connection.service';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RoomsComponent, ChatComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent implements AfterViewInit,OnDestroy {
  CurrentUserId!: string | null;
  private userIdSubscription!: Subscription;
  @ViewChild(RoomsComponent) roomComponent!:RoomsComponent;
  private _selectedRoomId!: number;
  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private userService:UserService,
    private cdr: ChangeDetectorRef,
    private roomService:RoomService,
    private connectionService:ConnectionService
  ) {
  }
  get selectedRoomId(): number {
    return this._selectedRoomId ?? null;
  }
  set selectedRoomId(value: number) {
    this._selectedRoomId = value;
  }
  onRoomIdChanged(id: number): void {
    this.selectedRoomId=-1;
    setTimeout(() => {
      const roomEntity = new FormData();
      roomEntity.append('userId',this.CurrentUserId??'');
      roomEntity.append('roomId',id.toString());
      roomEntity.append('isLogged','true');
      this.roomService.InsertEntityConnection(roomEntity).subscribe({
        next:()=>{
          this.selectedRoomId = id;
        }
      })
    }, 500);
    
  }
  ngAfterViewInit(): void {
    this.userIdSubscription = this.authService.userId$.subscribe((id) => {
      this.CurrentUserId = id;
      if (!this.CurrentUserId) {
        this.alertService.failure(`No User Is Logged `);
      }
      this.cdr.detectChanges();
    });
  }
   ngOnDestroy(): void {
    if (this.userIdSubscription) {
      this.userIdSubscription.unsubscribe();
    }
  }
  CommonConfirmDialog(
    inputTitle: string = 'Please Fill Out',
    inputType: 'text' | 'email' | 'password' | 'number' | 'textarea' = 'text',
    placeHolder: string = 'Input Name',
    customValidator?: (value: string) => string | null
  ): Promise<string | null> {
    return Swal.fire({
      title: inputTitle,
      input: inputType,
      inputPlaceholder: placeHolder,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value && inputType !== 'textarea') {
          return 'Please confirm your inputs first.';
        }
        if (customValidator) {
          return customValidator(value);
        }
        return null;
      },
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        return result.value as string;
      } else {
        return null;
      }
    });
  }
  ConfirmUsername(){
    this.CommonConfirmDialog('Login User','text','Username').then((value)=>{
      if(value){
        const userEntity=new FormData();
        userEntity.append('userName',value);
        this.userService.InsertEntity(userEntity).subscribe({
          next:(res)=>{
            this.authService.setUserId(res.data.userId);
          },
          error:(err)=>{
            this.alertService.failure(err.message);
          }
        })
      }
    })
  }
  ConfirmLogout(){
    this.alertService.confirm('Are you sure about logout ?','User Logout').then((value)=>{
      if(value){
        this.authService.clearUserId();
        this.roomComponent.refreshRooms();
      }
    })
  }
  ConfirmCreateRoom(){
    this.CommonConfirmDialog('Create Room','text','Room Name').then((value)=>{
      if(value){
        const roomEntity=new FormData();
        roomEntity.append('roomName',value);
        this.roomService.InsertRoomWithUser(this.CurrentUserId,roomEntity).subscribe({
          next:(res)=>{
            this.roomComponent.refreshRooms();
          },
          error:(err)=>{
            this.alertService.failure(err.message);
          }
        })
      }
    })
  }
  ConfirmJoinRoom(){
    this.CommonConfirmDialog('Join Room','number','Room Id').then((value)=>{
      if(value){
        const roomEntity = new FormData();
        roomEntity.append('userId',this.CurrentUserId ?? '');
        roomEntity.append('roomId',value.toString());
        this.connectionService.InsertEntity(roomEntity).subscribe({
          error:(err)=>{
            this.alertService.failure(err.message);
          }
        })
      }
    })
  }
}
