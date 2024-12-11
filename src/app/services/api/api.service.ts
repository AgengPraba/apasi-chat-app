import {
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  OrderByDirection,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private supabase: SupabaseClient;

  constructor(private firestore: Firestore) {
    // Konfigurasi Supabase
    const supabaseUrl = environment.supabaseUrl; // URL Supabase Anda
    const supabaseKey = environment.supabaseKey; // Key Supabase Anda
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  docRef(path) {
    return doc(this.firestore, path);
  }

  collectionRef(path) {
    return collection(this.firestore, path);
  }

  setDocument(path, data) {
    const dataRef = this.docRef(path);
    return setDoc<any, any>(dataRef, data); //set()
  }

  addDocument(path, data) {
    const dataRef = this.collectionRef(path);
    return addDoc<any, any>(dataRef, data); //add()
  }

  getDocById(path) {
    const dataRef = this.docRef(path);
    return getDoc(dataRef);
  }

  getDocs(path, queryFn?) {
    let dataRef: any = this.collectionRef(path);
    if (queryFn) {
      const q = query(dataRef, queryFn);
      dataRef = q;
    }
    return getDocs<any, any>(dataRef); //get()
  }

  collectionDataQuery(path, queryFn?) {
    let dataRef: any = this.collectionRef(path);
    if (queryFn) {
      const q = query(dataRef, queryFn);
      dataRef = q;
    }
    const collection_data = collectionData<any>(dataRef, { idField: 'id' }); // valuechanges, for doc use docData
    return collection_data;
  }

  docDataQuery(path, id?, queryFn?) {
    let dataRef: any = this.docRef(path);
    if (queryFn) {
      const q = query(dataRef, queryFn);
      dataRef = q;
    }
    let doc_data;
    if (id) doc_data = docData<any>(dataRef, { idField: 'id' });
    else doc_data = docData<any>(dataRef); // valuechanges, for doc use docData
    return doc_data;
  }

  whereQuery(fieldPath, condition, value) {
    return where(fieldPath, condition, value);
  }

  orderByQuery(fieldPath, directionStr: OrderByDirection = 'asc') {
    return orderBy(fieldPath, directionStr);
  }

  // Fungsi untuk upload gambar ke Supabase Storage
  async uploadImage(file: File): Promise<string | null> {
    console.log('Uploading image:', file);
    if (!file || !file.name) {
      console.error('No file provided or file has no name');
      return null;
    }

    const filePath = `images/${Date.now()}_${file.name}`; // Pastikan file.name ada
    console.log('File path:', filePath);

    // Upload file ke Supabase Storage
    const { data, error } = await this.supabase.storage
      .from('apasi-img')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      console.error('Error details:', error.message); // Detil pesan error
      return null;
    } else {
      console.log('File uploaded successfully:', data);
    }

    // Mendapatkan URL publik dari file yang sudah di-upload
    const { data: urlData } = this.supabase.storage
      .from('apasi-img')
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      console.error('Error getting public URL');
      return null; // Mengembalikan null jika terjadi error
    }

    // Kembalikan URL gambar yang valid
    console.log('Image URL:', publicUrl);
    return publicUrl;
  }

  async updateUserProfile(userId: string, data: any) {
    const userPath = `users/${userId}`;
    try {
      await this.setDocument(userPath, data);
      console.log('Profile updated successfully:', data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  getUserProfile(userId: string) {
    const userPath = `users/${userId}`;
    return this.getDocById(userPath);
  }
}
