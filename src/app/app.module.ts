import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'apasi-chat-app',
        appId: '1:10787351676:web:f753a3f737297f5e542df9',
        storageBucket: 'apasi-chat-app.firebasestorage.app',
        apiKey: 'AIzaSyAuULieAwBoI5-V2G7qxXqgRxs0vyyqdeA',
        authDomain: 'apasi-chat-app.firebaseapp.com',
        messagingSenderId: '10787351676',
        measurementId: 'G-SCGVPEWERC',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
