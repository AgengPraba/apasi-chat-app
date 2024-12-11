import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { Observable, take } from 'rxjs';
import { ChatService } from 'src/app/services/chat/chat.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('new_chat') modal: ModalController;
  @ViewChild('popover') popover: PopoverController;
  segment: string = 'profile';
  open_new_chat: boolean = false;
  users: Observable<any[]>;
  chatRooms: Observable<any[]>;
  model = {
    icon: 'chatbubbles-outline',
    title: 'No Chat Rooms',
    color: 'danger',
  };

  currentUserId: any;
  currentUserProfile: any;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    try {
      this.currentUserId = this.authService.getId();
      this.currentUserProfile = await this.authService.getUserData(
        this.currentUserId
      );
      this.getRooms();
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  getRooms() {
    // this.chatService.getId();
    this.chatService.getChatRooms();
    this.chatRooms = this.chatService.chatRooms;
    console.log('chatrooms: ', this.chatRooms);
  }

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

  async startChat(item) {
    try {
      // this.global.showLoader();
      // create chatroom
      const room = await this.chatService.createChatRoom(item?.uid);
      console.log('room: ', room);
      this.cancel();
      const navData: NavigationExtras = {
        queryParams: {
          name: item?.name,
        },
      };
      this.router.navigate(['/', 'home', 'chats', room?.id], navData);
      // this.global.hideLoader();
    } catch (e) {
      console.log(e);
      // this.global.hideLoader();
    }
  }
  getChat(item) {
    (item?.user).pipe(take(1)).subscribe((user_data) => {
      console.log('data: ', user_data);
      const navData: NavigationExtras = {
        queryParams: {
          name: user_data?.name,
        },
      };
      this.router.navigate(['/', 'home', 'chats', item?.id], navData);
    });
  }

  getUser(user: any) {
    return user;
  }

  async editField(field: 'name' | 'bio') {
    const alert = await this.alertController.create({
      header: `Edit ${field === 'name' ? 'Name' : 'Bio'}`,
      inputs: [
        {
          name: field,
          type: 'text',
          value: this.currentUserProfile[field],
          placeholder: `Enter your ${field}`,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (data[field] && data[field].trim() !== '') {
              // Perbarui profil pengguna di state lokal
              this.currentUserProfile[field] = data[field];

              // Gabungkan data yang sudah ada dengan data yang baru
              const updatedProfile = { ...this.currentUserProfile };

              // Simpan pembaruan ke Firebase menggunakan ApiService
              try {
                await this.apiService.updateUserProfile(
                  this.currentUserId,
                  updatedProfile
                );
                console.log(`${field} updated successfully`);
              } catch (error) {
                console.error(`Failed to update ${field}:`, error);
              }
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async ionViewWillEnter() {
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      const userDoc = await this.apiService.getUserProfile(this.currentUserId);
      if (userDoc.exists()) {
        this.currentUserProfile = {
          id: this.currentUserId,
          ...userDoc.data(),
        };
        console.log('User profile loaded:', this.currentUserId);
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }
}
