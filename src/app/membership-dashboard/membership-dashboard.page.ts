import { Component } from '@angular/core';
import { AnimationController, ModalController } from '@ionic/angular';
import { ModalComponent } from '../shared/modal/modal.component';
import { Router } from '@angular/router';
export let tempThis: any;

@Component({
	selector: 'app-membership-dashboard',
	templateUrl: './membership-dashboard.page.html',
	styleUrls: ['./membership-dashboard.page.scss'],
})
export class MembershipDashboardPage {
	constructor(private animationCtrl: AnimationController, private modalCtrl: ModalController, private router: Router) {}

	ionViewWillLeave() {
		this.modalCtrl.dismiss();
	}

	async submit() {
		const modal = await this.modalCtrl.create({
			component: ModalComponent,
			componentProps: {
				title: "Title",
				normalTitle: true,
				descriptionTitle: "description",
				description: "Description text",
				primaryActionText: "OK",
				primaryAction: () => {},
				secondaryAction: () => {},
				secondaryActionText: "secondary"

			},
		})
		modal.present();
		const { role } = await modal.onWillDismiss();
		if (role === 'confirm') {
			this.modalCtrl.dismiss();
			this.router.navigate(['/'], { replaceUrl: true });
		}
	}

	public leaveAnimation = (baseEl: HTMLElement) => {
		const fadeOut = this.animationCtrl
			.create()
			.addElement(baseEl)
			.keyframes([
				{ offset: 0, opacity: '1' },
				{ offset: 1, opacity: '0' },
			]);

		return this.animationCtrl.create().easing('ease-out').duration(300).addAnimation([fadeOut]);
	};
}
