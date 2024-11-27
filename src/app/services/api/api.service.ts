import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
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

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(public firestore: Firestore) {}

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

  async deleteDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(this.firestore, collectionName, docId);
      await deleteDoc(docRef);  // Menghapus dokumen dari koleksi
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  }
}
