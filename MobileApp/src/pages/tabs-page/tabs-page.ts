import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { SchedulePage } from '../schedule/schedule';
import { MeetingPage } from '../meeting/meeting';
import { FeedbackPage } from '../feedback/feedback';


@Component({
  templateUrl: 'tabs-page.html'
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = SchedulePage;
  tab2Root: any = MeetingPage;
  tab3Root: any = FeedbackPage;
  mySelectedIndex: number;

  constructor(navParams: NavParams) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }

}
