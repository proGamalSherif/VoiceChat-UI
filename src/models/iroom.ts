import { IRoomChat } from "./iroom-chat";
export interface IRoom {
    roomId:number;
    roomName:string;
    createdIn:Date;
    closedTime:Date;
    roomChats:IRoomChat[];
}
