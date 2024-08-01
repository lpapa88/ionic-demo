import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  segmentList = ["See what's new", "Member Benefits", "Discounts", "Travel", "Via"];
  selectedSegment = this.segmentList[0];

  constructor(private router: Router) {}

  openPage(_: any) {
    this.router.navigate(['/tabs/tab1/membership-dashboard']);
  }

  _segmentSelected(index: number) {
		// this.selectedExploreData = this.filteredExploreData[index];

		// this.cdr.detectChanges();
		// const element = document.getElementById('first-element-explore-aaa');
		// if (element)
		// 	element.focus({
		// 		preventScroll: true,
		// 	});
  } 

}
