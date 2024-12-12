import { Component, OnInit, ViewChild } from '@angular/core';
import { App } from '@capacitor/app';
import { orderBy, query } from 'firebase/firestore';
import { getAuth } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
} from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { map, Observable, take } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { StatusService } from 'src/app/services/status/status.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { NavController } from '@ionic/angular';

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
  open_create_status: boolean = false;
  users: Observable<any[]>;
  chatRooms: Observable<any[]>;
  model = {
    icon: 'chatbubbles-outline',
    title: 'No Chat Rooms',
    color: 'danger',
  };

  statuses: {
    message: string;
    selectedImage?: string | ArrayBuffer | null; // Tambahkan properti untuk gambar
    imageUrl?: string; // URL gambar yang diunggah
    datetime: string;
    userId: string;
    id: string;
  }[] = [];

  newStatus: string = '';
  userDetail: { [key: string]: any } = {};
  currentUserId: any;
  currentUserProfile: any;
  selectedFile: File | null = null;
  selectedImage: string | null = null; // Tambahkan ini
  isPosting: boolean;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private statusService: StatusService,
    private apiService: ApiService,
    private firestore: Firestore,
    private auth: AuthService,
    private authService: AuthService,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private toastController: ToastController,
    private platform: Platform,
    private location: Location,
    private navCtrl: NavController
  ) {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.handleBackButton();
    });
  }

  handleBackButton() {
    if (this.segment !== 'chats') {
      this.segment = 'chats';
      return;
    }

    // Jika di halaman home
    if (this.router.url === '/home') {
      // Tampilkan konfirmasi keluar
      this.presentAlertConfirm();
    } else {
      // Coba navigasi back dengan metode berbeda
      try {
        // Metode 1: Coba router
        this.router.navigate(['/home'], {
          replaceUrl: true,
        });
      } catch (error) {
        // Metode 2: Gunakan navCtrl
        this.navCtrl.navigateRoot('/home');
      }
    }
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      message: 'Do You Want to Exit?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Exit',
          handler: () => {
            App.exitApp();
          },
        },
      ],
    });

    await alert.present();
  }

  async loadCurrentUser() {
    this.currentUserId = this.auth.getId();
  }

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

    this.getStatuses();

    this.loadCurrentUser();
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

  createStatus() {
    this.open_create_status = true;
  }

  getUsers() {
    this.chatService.getUsers();
    this.users = this.chatService.users;
  }

  onWillDismiss(event: any) {}

  cancel() {
    this.modal.dismiss();
    this.open_new_chat = false;
    this.open_create_status = false;
  }

  async startChat(item) {
    try {
      const room = await this.chatService.createChatRoom(item?.uid);
      console.log('room: ', room);
      this.cancel();
      const navData: NavigationExtras = {
        queryParams: {
          name: item?.name,
        },
      };
      this.router.navigate(['/', 'home', 'chats', room?.id], navData);
    } catch (e) {
      console.log(e);
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
              this.currentUserProfile[field] = data[field];
              const updatedProfile = { ...this.currentUserProfile };

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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();

      // Membaca file sebagai Data URL
      reader.onload = (e) => {
        const result = e.target?.result as string | null;

        // Menyimpan hasil pembacaan file untuk preview
        if (result) {
          this.selectedImage = result; // Menyimpan data URL untuk preview
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async getStatuses() {
    // Mengurutkan status berdasarkan timestamp dari yang terbaru
    const statusesQuery = query(
      collection(this.firestore, 'statuses'),
      orderBy('datetime', 'desc')
    );

    const querySnapshot = await getDocs(statusesQuery);
    this.statuses = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        message: data['message'],
        datetime: data['datetime'],
        userId: data['userId'],
        id: doc.id,
        imageUrl: data['imageUrl'],
      };
    });
    // Panggil getUserData untuk setiap userId unik setelah memuat status
    for (const status of this.statuses) {
      await this.getUserData(status.userId); // Load data user untuk setiap status
    }

    await Promise.all(
      this.statuses.map(async (status) => {
        await this.getUserData(status.userId);
      })
    );
  }

  async addStatus() {
    // Validasi minimal memiliki pesan atau gambar
    if (
      (this.newStatus.trim() !== '' || this.selectedFile) &&
      !this.isPosting
    ) {
      try {
        this.isPosting = true;
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const datetime = new Date();
          let imageUrl = null;

          // Upload gambar jika ada
          if (this.selectedFile) {
            try {
              imageUrl = await this.apiService.uploadImage(this.selectedFile);
            } catch (uploadError) {
              console.error('Gagal mengunggah gambar:', uploadError);
              this.presentToast('Gagal mengunggah gambar');
              this.isPosting = false;
              return;
            }
          }

          // Hanya lanjutkan jika ada pesan atau gambar
          if (this.newStatus.trim() !== '' || imageUrl) {
            // Simpan status ke Firestore
            await addDoc(collection(this.firestore, 'statuses'), {
              message: this.newStatus.trim() || '', // Kirim string kosong jika tidak ada pesan
              imageUrl: imageUrl || null, // Kirim null jika tidak ada gambar
              datetime,
              userId: this.auth.getId(),
            });

            // Reset form
            this.resetStatusForm();

            // Refresh daftar status
            this.getStatuses();

            // Tutup modal
            this.open_create_status = false;
          }
        }
      } catch (error) {
        console.error('Gagal menambahkan status:', error);
        this.presentToast('Gagal mengirim status');
      } finally {
        this.isPosting = false;
      }
    }
  }

  // Metode tambahan untuk mereset formulir
  private resetStatusForm() {
    this.newStatus = '';
    this.selectedFile = null;
    this.selectedImage = null;
  }

  // Metode untuk menampilkan toast (pastikan Anda sudah mengimport ToastController)
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  async getUserData(userId: string) {
    if (!this.userDetail[userId]) {
      try {
        const userData = await this.auth.getUserData(userId);
        if (userData) {
          this.userDetail[userId] = userData; // Simpan data jika berhasil diambil
        } else {
          this.userDetail[userId] = {
            name: 'Unknown',
            photoUrl: 'assets/default-avatar.png',
          }; // Fallback jika tidak ada data
        }
      } catch (error) {
        console.error(`Failed to load user data for userId ${userId}:`, error);
        this.userDetail[userId] = {
          name: 'Error',
          photoUrl: 'assets/default-avatar.png',
        }; // Fallback jika terjadi error
      }
    }
    return this.userDetail[userId]; // Kembalikan data yang telah di-cache
  }

  async confirmDeleteStatus(statusId) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this status?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Delete canceled');
          },
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: () => {
            this.deleteStatus(statusId);
          },
        },
      ],
    });

    await alert.present();
  }
  async deleteStatus(id: string) {
    // Hapus status dari Firestore
    const statusRef = doc(this.firestore, 'statuses', id);
    await deleteDoc(statusRef);
    // Hapus status dari array statuses
    this.statuses = this.statuses.filter((status) => status.id !== id);
    console.log(`Deleting status with id: ${id}`);
  }

  getFormattedDate(timestamp: any): { date: string; time: string } {
    if (!timestamp || !timestamp.seconds) {
      console.error('Invalid timestamp:', timestamp);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }

    const dateObj = new Date(timestamp.seconds * 1000);

    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object:', dateObj);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }

    const date = dateObj.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const time = dateObj.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { date, time };
  }

  // async presentActionSheet(statusUserId, currentUserId) {
  //   // Pastikan hanya pemilik status yang bisa menghapus
  //   if (statusUserId !== currentUserId) {
  //     return;
  //   }

  //   const actionSheet = await this.actionSheetCtrl.create({
  //     header: 'Status Opsi',
  //     buttons: [
  //       {
  //         text: 'Hapus Status',
  //         role: 'destructive',
  //         icon: 'trash',
  //         handler: () => {
  //           this.deleteStatus(statusUserId);
  //         },
  //       },
  //       {
  //         text: 'Batal',
  //         role: 'cancel',
  //         icon: 'close',
  //         handler: () => {
  //           console.log('Aksi dibatalkan');
  //         },
  //       },
  //     ],
  //   });

  //   await actionSheet.present();
  // }

  clearSelectedImage() {
    this.selectedImage = null;
  }

  changeProfilePicture() {
    // Memicu input file tersembunyi
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput.click();
  }

  async onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        // Upload gambar ke Supabase Storage
        const imageUrl = await this.apiService.uploadImage(file);

        if (imageUrl) {
          // Update profil pengguna dengan URL gambar baru
          await this.apiService.updateUserProfile(this.currentUserId, {
            photo: imageUrl,
          });

          // Update foto profil lokal
          this.currentUserProfile.photo = imageUrl;

          // Opsional: Tampilkan pesan berhasil
          this.presentToast('Foto profil berhasil diperbarui');
        }
      } catch (error) {
        // Tangani error
        console.error('Gagal mengganti foto profil:', error);
        this.presentToast('Gagal mengganti foto profil');
      }
    }
  }
}
