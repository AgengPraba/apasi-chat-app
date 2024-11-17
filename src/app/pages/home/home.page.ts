import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('new_chat') modal: ModalController;
  @ViewChild('popover') popover: PopoverController;
  segment: string = 'chats ';
  open_new_chat: boolean = false;
  users = [
    { id: 1, name: 'John Doe', photo: 'https://i.pravatar.cc/315' },
    { id: 2, name: 'John Dono', photo: 'https://i.pravatar.cc/316' },
    { id: 3, name: 'John Dani', photo: 'https://i.pravatar.cc/317' },
  ];
  chatRooms = [
    { id: 1, name: 'John Doe', photo: 'https://i.pravatar.cc/315' },
    { id: 2, name: 'John Dono', photo: 'https://i.pravatar.cc/316' },
    { id: 3, name: 'John Dani', photo: 'https://i.pravatar.cc/317' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  logout() {}

  onSegmentChanged(event: any) {
    this.segment = event.detail.value;
  }
  newChat() {
    this.open_new_chat = true;
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
