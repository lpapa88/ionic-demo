import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MembershipDashboardPageRoutingModule } from './membership-dashboard-routing.module';
import { MembershipDashboardPage } from './membership-dashboard.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		MembershipDashboardPageRoutingModule,
		SharedModule
	],
	providers: [],
	declarations: [
		MembershipDashboardPage
	],
})
export class MembershipDashboardPageModule {}
