import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

export const routes: Routes = [
	{
		path: '',
		component: HomePage,
	},
	{
		path: 'membership-dashboard',
		loadChildren: () =>
			import('../membership-dashboard/membership-dashboard.module').then((m) => m.MembershipDashboardPageModule),
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class HomePageRoutingModule {}
