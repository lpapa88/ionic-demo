import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1Page } from './tab1.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1Page,
  },
  {
		path: 'membership-dashboard',
		loadChildren: () =>
			import('../membership-dashboard/membership-dashboard.module').then((m) => m.MembershipDashboardPageModule),
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1PageRoutingModule {}
