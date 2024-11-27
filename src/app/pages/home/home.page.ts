import { Component, OnInit, ViewChild } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { map, Observable, take } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { StatusService } from 'src/app/services/status/status.service';

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
  statuses: { message: string; timestamp: string; id: string }[] = []; // Menambahkan id pada tipe data
  newStatus: string = ''; // Input status baru
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

  constructor(
    private router: Router, 
    private chatService: ChatService, 
    private statusService: StatusService,
    private api: ApiService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
     // Panggil getRooms untuk mengambil chat rooms
    this.getRooms();

    // Panggil getStatuses untuk mengambil status
    this.getStatuses();
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
      const data = doc.data(); // Ambil data dari Firestore
      return { 
        message: data['message'],     // Akses menggunakan bracket notation
        timestamp: data['timestamp'], // Akses menggunakan bracket notation
        id: doc.id                    // Ambil 'id' dari Firestore
      };
    });
  }  

  async addStatus() {
    if (this.newStatus.trim() !== '') {
      const timestamp = this.getTime(); // Ambil waktu
      try {
        const docRef = await addDoc(collection(this.firestore, 'statuses'), {
          message: this.newStatus,
          timestamp: timestamp,
        });
        this.statuses.unshift({
          message: this.newStatus,
          timestamp: timestamp,
          id: docRef.id, // Menambahkan ID dari Firestore
        });
        this.newStatus = ''; // Menghapus input setelah ditambahkan
      } catch (e) {
        console.error('Error adding status: ', e);
      }
    }
  }  

  // Fungsi untuk mendapatkan waktu
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
}
