import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { Observable, take } from 'rxjs';
import { ChatService } from 'src/app/services/chat/chat.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('new_chat') modal: ModalController;
  @ViewChild('popover') popover: PopoverController;
  segment: string = 'chats';
  open_new_chat: boolean = false;
  users: Observable<any[]>;
  chatRooms: Observable<any[]>;
  model = {
    icon: 'chatbubbles-outline',
    title: 'No Chat Rooms',
    color: 'danger'
  };
  // users = [
  //   { id: 1, name: 'John Doe', photo: 'https://i.pravatar.cc/400?img=1' },
  //   { id: 2, name: 'John Dono', photo: 'https://i.pravatar.cc/400?img=2' },
  //   { id: 3, name: 'John Dani', photo: 'https://i.pravatar.cc/400?img=3' },
  // ];
  // chatRooms = [
  //   { id: 1, name: 'John Doe', photo: 'https://i.pravatar.cc/400?img=1' },
  //   { id: 2, name: 'John Dono', photo: 'https://i.pravatar.cc/400?img=2' },
  //   { id: 3, name: 'John Dani', photo: 'https://i.pravatar.cc/400?img=3' },
  // ];

  constructor(private router: Router, private chatService: ChatService) {}

  ngOnInit() {
    this.getRooms();
  }

  getRooms(){
    this.chatService.getChatRooms();
    this.chatRooms = this.chatService.chatRooms;
    console.log('chatrooms: ', this.chatRooms);
  }

  async logout() {
    try {
      console.log('logout');
      this.popover.dismiss();
      await this.chatService.auth.logout();
      this.chatService.currentUserId = null;
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (e) {
      console.log(e);
    }
  }

  onSegmentChanged(event: any) {
    this.segment = event.detail.value;
  }
  newChat() {
    this.open_new_chat = true;
    if (!this.users) this.getUsers();
  }

  getUsers() {
    this.chatService.getUsers();
    this.users = this.chatService.users;
  }

  onWillDismiss(event: any) {}

  cancel() {
    this.modal.dismiss();
    this.open_new_chat = false;
  }

  async startChat(item) {
    try {
      const room = await this.chatService.createChatRoom(item?.uid);
      console.log('room: ', room);
      this.cancel();
      const navData: NavigationExtras = {
        queryParams: {
          name: item?.name
        }
      };
      this.router.navigate(['/', 'home', 'chats', room?.id], navData);
    } catch(e){
      console.log(e);
    }
  }

  getChat(item) {
    (item?.user).pipe(
      take(1)
    ).subscribe(user_data => {
      console.log('data: ', user_data);
      const navData: NavigationExtras = {
        queryParams: {
          name: user_data?.name
        }
      };
      this.router.navigate(['/', 'home', 'chats', item?.id], navData);
    })
  }

  getUser(user: any){
    return user;
  }
}
