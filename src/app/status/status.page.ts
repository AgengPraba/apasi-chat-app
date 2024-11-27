import { Component } from '@angular/core';

@Component({
  selector: 'app-status',
  templateUrl: './status.page.html',
  styleUrls: ['./status.page.scss'],
})
export class StatusPage {
  newStatus: string = ''; // Menyimpan status baru
  statuses: string[] = []; // Menyimpan daftar status

  // Menambahkan status baru ke daftar
  addStatus() {
    if (this.newStatus.trim() !== '') {
      this.statuses.unshift(this.newStatus); // Tambahkan status baru di atas daftar
      this.newStatus = ''; // Reset input
    }
  }

  // Fungsi untuk mendapatkan waktu saat ini (dummy)
  getTime(): string {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  }
}