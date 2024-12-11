import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { doc, deleteDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  currentUserId: string;

  constructor(private auth: AuthService, private api: ApiService) {
    this.getId();
  }

  getId() {
    this.currentUserId = this.auth.getId();
  }

  // Fungsi untuk menambahkan status baru
  async addStatus(statusText: string) {
    try {
      const statusData = {
        text: statusText,
        userId: this.currentUserId,
        createdAt: new Date(),
      };
      const newStatus = await this.api.addDocument('statuses', statusData);
      return newStatus;
    } catch (error) {
      throw error;
    }
  }

  // Fungsi untuk mengambil semua status
  getStatuses(): Observable<any> {
    return this.api.collectionDataQuery('statuses', this.api.orderByQuery('createdAt', 'desc'));
  }

  // Fungsi untuk mengambil status berdasarkan userId
  getUserStatuses(userId: string): Observable<any> {
    return this.api.collectionDataQuery(
      'statuses',
      this.api.whereQuery('userId', '==', userId)
    );
  }

  // Fungsi untuk menghapus status berdasarkan statusId
  async deleteStatus(statusId: string) {
    try {
      const statusDocRef = doc(this.api.firestore, `statuses/${statusId}`);
      await deleteDoc(statusDocRef); // Menghapus status berdasarkan ID
      console.log('Status deleted successfully');
    } catch (error) {
      console.error('Error deleting status: ', error);
      throw error;
    }
  }
}
