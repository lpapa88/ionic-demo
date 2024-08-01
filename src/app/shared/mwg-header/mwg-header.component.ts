import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'mwg-header',
	templateUrl: 'mwg-header.component.html',
	styleUrls: ['mwg-header.component.scss'],
})
export class MwgHeaderComponent implements OnInit {


	public headerBorder = '';

	constructor() {}

	ngOnInit(): void {
	}

	public handleBackNavigation(): void {}
}
