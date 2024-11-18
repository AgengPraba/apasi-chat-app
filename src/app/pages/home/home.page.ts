import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
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
  // users = [
  //   { id: 1, name: 'John Doe', photo: 'https://i.pravatar.cc/400?img=1' },
  //   { id: 2, name: 'John Dono', photo: 'https://i.pravatar.cc/400?img=2' },
  //   { id: 3, name: 'John Dani', photo: 'https://i.pravatar.cc/400?img=3' },
  // ];
  chatRooms = [
    { id: 1, name: 'John Doe', photo: 'https://i.pravatar.cc/400?img=1' },
    { id: 2, name: 'John Dono', photo: 'https://i.pravatar.cc/400?img=2' },
    { id: 3, name: 'John Dani', photo: 'https://i.pravatar.cc/400?img=3' },
  ];

  constructor(private router: Router, private chatService: ChatService) {}

  ngOnInit() {}

  async logout() {
    try {
      console.log('logout');
      this.popover.dismiss();
      await this.chatService.auth.logout();
      // this.chatService.currentUserId = null;
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

  startChat(item) {}

  getChat(item) {
    this.router.navigate(['/', 'home', 'chats', item?.id]);
  }
}
