import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Sesuaikan jika perlu
  { path: 'status', loadChildren: () => import('./status.module').then(m => m.StatusPageModule) },
  // Rute lainnya...
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class StatusPageRoutingModule {}
