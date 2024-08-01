import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MwgHeaderComponent } from './mwg-header/mwg-header.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
	],
	declarations: [MwgHeaderComponent],
    exports: [MwgHeaderComponent],
	providers: [],
})
export class SharedModule {}
