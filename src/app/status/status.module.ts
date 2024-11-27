import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { StatusPage } from './status.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // Pastikan ini diimpor
    IonicModule,
    RouterModule.forChild([{ path: '', component: StatusPage }])
  ],
  declarations: [StatusPage]
})
export class StatusPageModule {}