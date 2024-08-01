import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MembershipDashboardPage } from './membership-dashboard.page';

const routes: Routes = [
	{
		path: '',
		component: MembershipDashboardPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class MembershipDashboardPageRoutingModule {}
