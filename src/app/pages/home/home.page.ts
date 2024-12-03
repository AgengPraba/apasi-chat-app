import { Component, OnInit, ViewChild } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { map, Observable, take } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { StatusService } from 'src/app/services/status/status.service';
import { AuthService } from 'src/app/services/auth/auth.service';

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

  statuses: {
    message: string;
    timestamp: Date;
    date: string;
    userId: string;
    id: string;
  }[] = [];
  newStatus: string = ''; 

  userDetail: { [key: string]: any } = {};

  currentUserId: string;

  constructor(
    private router: Router, 
    private chatService: ChatService, 
    private statusService: StatusService,
    private api: ApiService,
    private firestore: Firestore,
    private auth: AuthService
  ) {}

  ngOnInit() {
     // Panggil getRooms untuk mengambil chat rooms
    this.getRooms();

    // Panggil getStatuses untuk mengambil status
    this.getStatuses();

    this.loadCurrentUser();
  }

  async loadCurrentUser() {
    this.currentUserId = this.auth.getId();
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

  async getStatuses() {
    const querySnapshot = await getDocs(collection(this.firestore, 'statuses'));
    this.statuses = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        message: data['message'],
        timestamp: data['timestamp'],
        date: data['date'],
        userId: data['userId'],
        id: doc.id
      };
    });
    
    // Panggil getUserData untuk setiap userId unik setelah memuat status
    for (const status of this.statuses) {
      await this.getUserData(status.userId); // Load data user untuk setiap status
    }
  }  
  

  async addStatus() {
    if (this.newStatus.trim() !== '') {
      const auth = getAuth();
      const user = auth.currentUser;
      console.log('---------------------------------', auth);
  
      if (user) {
        const timestamp = this.getTime(); // Jam saat ini
        const date = this.getDate();      // Tanggal saat ini
        
        await addDoc(collection(this.firestore, 'statuses'), {
          message: this.newStatus,
          timestamp: timestamp,
          date: date,
          userId: this.auth.getId(),
        });
        this.newStatus = ''; // Hapus input setelah status ditambahkan
        this.getStatuses();  // Refresh status dari database
      }
    }
  }

  async getUserData(userId: string) {
    if (!this.userDetail[userId]) {
      try {
        const userData = await this.auth.getUserData(userId);
        if (userData) {
          this.userDetail[userId] = userData; // Simpan data jika berhasil diambil
        } else {
          this.userDetail[userId] = { name: 'Unknown', photoUrl: 'assets/default-avatar.png' }; // Fallback jika tidak ada data
        }
      } catch (error) {
        console.error(`Failed to load user data for userId ${userId}:`, error);
        this.userDetail[userId] = { name: 'Error', photoUrl: 'assets/default-avatar.png' }; // Fallback jika terjadi error
      }
    }
    return this.userDetail[userId]; // Kembalikan data yang telah di-cache
  }
  

  getTime(): string {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  // Fungsi untuk menghapus status berdasarkan id
  async deleteStatus(id: string) {
    console.log(`Deleting status with id: ${id}`);
    // Hapus status dari Firestore
    const statusRef = doc(this.firestore, 'statuses', id);
    await deleteDoc(statusRef);
    // Hapus status dari array statuses
    this.statuses = this.statuses.filter(status => status.id !== id);
  }

  getDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return now.toLocaleDateString(undefined, options); // Menghasilkan format tanggal seperti "29 November 2024"
  }
}
