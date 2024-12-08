import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ChatService } from 'src/app/services/chat/chat.service';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;

  selectedImage: string | ArrayBuffer | null = null;
  id: string;
  name: string;
  chats: Observable<any[]>;
  message: string;
  isLoading: boolean;
  model = {
    icon: 'chatbubbles-outline',
    title: 'No Conversation',
    color: 'danger',
  };
  currentUserId: any = this.chatService.getId();

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    public chatService: ChatService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const data: any = this.route.snapshot.queryParams;
    // console.log('data: ', data);
    if (data?.name) {
      this.name = data.name;
    }
    const id = this.route.snapshot.paramMap.get('id');
    // console.log('check id: ', id);
    if (!id) {
      this.navCtrl.back();
      return;
    }
    this.id = id;
    this.chatService.getChatRoomMessages(this.id);
    this.chats = this.chatService.selectedChatRoomMessages;
    // console.log(this.chats);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.chats) this.content.scrollToBottom(500);
  }

  // async sendMessage() {

  //   if (!this.message && !this.selectedImage) {
  //     return;
  //   }

  //   try {
  //     this.isLoading = true;

  //     // Kirim pesan jika ada gambar atau teks
  //     if (this.selectedImage && this.message.trim() === '') {
  //       // Hanya gambar
  //       await this.chatService.sendMessage(
  //         this.id,
  //         this.selectedImage as unknown as File
  //       );
  //     } else if (this.message.trim() !== '') {
  //       // Hanya teks
  //       await this.chatService.sendMessage(this.id, this.message);
  //     } else {
  //       // Gabungan gambar dan teks
  //       await this.chatService.sendMessage(this.id, this.message);
  //     }

  //     this.message = '';
  //     this.selectedImage = null;
  //     this.isLoading = false;
  //     this.scrollToBottom();
  //   } catch (e) {
  //     this.isLoading = false;
  //     console.log(e);
  //   }
  // }

  async sendMessage() {
    if (!this.message && !this.selectedImage) {
      return;
    }

    try {
      this.isLoading = true;
      let messageData: any = {
        sender: this.currentUserId,
        createdAt: new Date(),
      };

      // Jika hanya gambar
      if (this.selectedImage && this.message === '') {
        // Convert data URL to File
        const blob = await (await fetch(this.selectedImage as string)).blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });

        const imageUrl = await this.apiService.uploadImage(file);
        console.log('imageUrl:', imageUrl);
        messageData = {
          ...messageData,
          imageUrl: imageUrl, // Menambahkan imageUrl
        };
      }

      // Gabungan gambar dan teks
      else if (this.selectedImage && this.message.trim() !== '') {
        const blob = await (await fetch(this.selectedImage as string)).blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });
        const imageUrl = await this.apiService.uploadImage(file);
        messageData = {
          ...messageData,
          message: this.message, // Menambahkan teks
          imageUrl: imageUrl, // Menambahkan imageUrl
        };
      }
      // Jika hanya teks
      else if (this.message.trim() !== '') {
        messageData = {
          ...messageData,
          message: this.message, // Menambahkan teks
        };
      }

      // Kirim pesan ke chatService
      await this.chatService.sendMessage(this.id, messageData);
      this.message = ''; // Reset message
      this.selectedImage = null; // Reset selected image
      this.isLoading = false;
      this.scrollToBottom();
    } catch (e) {
      this.isLoading = false;
      console.log(e);
    }
  }

  // Fungsi untuk memilih gambar
  selectImage(event: any): void {
    const file = event.target.files[0]; // Ambil file pertama yang dipilih
    if (file) {
      const reader = new FileReader();

      // Fungsi yang dipanggil ketika FileReader selesai membaca file
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result; // Set imageUrl dengan hasil pembacaan file
        console.log('Image URL:', this.selectedImage); // Log untuk memastikan URL valid
      };

      reader.readAsDataURL(file); // Baca file sebagai URL data
    }
  }
}
