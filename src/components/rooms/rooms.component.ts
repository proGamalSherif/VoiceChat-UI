import { Component, EventEmitter, OnInit, Output, ViewRef } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { ConnectionService } from '../../services/connection.service';
import { AuthService } from '../../services/auth.service';
import { IConnection } from '../../models/iconnection';

@Component({
  selector: 'app-rooms',
  imports: [],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css',
})
export class RoomsComponent implements OnInit {
  RoomArr!: IConnection[];
  LoggedUser!:string | null;
  @Output() roomId = new EventEmitter<number>();
  constructor(
    private connectionService: ConnectionService,
    private alertService: AlertService,
    private authService:AuthService
  ) {
    this.authService.userId$.subscribe((id)=>{
      this.LoggedUser=id;
    })
  }
  ngOnInit(): void {
    this.refreshRooms();
  }
  public refreshRooms() {
    this.RoomArr = [];
    if(this.LoggedUser){
      this.connectionService.GetAllByUserId(this.LoggedUser).subscribe({
      next: (res) => {
        this.RoomArr = res.data;
      },
      error: (err) => {
        this.alertService.failure(err.message);
      },
    });
    }
  }
  sendRoomIdToParent(id:number){
    this.roomId.emit(id);
  }
}
