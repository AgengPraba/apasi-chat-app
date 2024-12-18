import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
  @Input() chat: any;
  @Input() current_user_id: any;

  constructor() {}

  ngOnInit() {
    console.log('Chat Object:', this.chat);
  }
}
