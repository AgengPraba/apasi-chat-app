import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  currentUserId: string;
  public users: Observable<any>;
  public chatRooms: Observable<any>;
  public selectedChatRoomMessages: Observable<any>;

  constructor(public auth: AuthService, private api: ApiService) {
    this.getId();
  }

  getId() {
    console.log(this.currentUserId);
    this.currentUserId = this.auth.getId();
  }

  getUsers() {
    this.users = this.api.collectionDataQuery(
      'users',
      this.api.whereQuery('uid', '!=', this.currentUserId)
    );
  }

  async createChatRoom(user_id) {
    try {
      // check for existing chatroom
      let room: any;
      const querySnapshot = await this.api.getDocs(
        'chatRooms',
        this.api.whereQuery('members', 'in', [
          [user_id, this.currentUserId],
          [this.currentUserId, user_id],
        ])
      );
      room = await querySnapshot.docs.map((doc: any) => {
        let item = doc.data();
        item.id = doc.id;
        return item;
      });
      console.log('exist docs: ', room);
      if (room?.length > 0) return room[0];
      const data = {
        members: [this.currentUserId, user_id],
        type: 'private',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      room = await this.api.addDocument('chatRooms', data);
      return room;
    } catch (e) {
      throw e;
    }
  }
}
