import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MwgHeaderComponent } from './mwg-header/mwg-header.component';
import { ModalComponent } from './modal/modal.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
	],
	declarations: [MwgHeaderComponent, ModalComponent],
    exports: [MwgHeaderComponent, ModalComponent],
	providers: [],
})
export class SharedModule {}
