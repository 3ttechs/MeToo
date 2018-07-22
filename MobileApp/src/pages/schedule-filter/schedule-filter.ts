import { Component } from '@angular/core';

import { NavParams, ViewController } from 'ionic-angular';

import { MeetingProvider } from '../../providers/meeting-provider';


@Component({
  selector: 'page-schedule-filter',
  templateUrl: 'schedule-filter.html'
})
export class ScheduleFilterPage {
  tracks: Array<{name: string, isChecked: boolean}> = [];

  constructor(
    public confData: MeetingProvider,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    // passed in array of track names that should be excluded (unchecked)
    let excludedTrackNames = this.navParams.data;
    console.log('excludedTrackNames.length : ' + excludedTrackNames.length);

      let trackNames: string[] = this.confData.getCategories();
      trackNames.forEach(trackName => {
        console.log('trackName : ' + trackName);
        this.tracks.push({
          name: trackName,
          isChecked: (excludedTrackNames.indexOf(trackName) === -1)
        });
      });

    
  }

  resetFilters() {
    // reset all of the toggles to be checked
    alert("This is my resetFilters");
    this.tracks.forEach(track => {
      track.isChecked = true;
    });
  }

  applyFilters() {
    
    // Pass back a new array of track names to exclude
    let excludedTrackNames = this.tracks.filter(c => !c.isChecked).map(c => c.name);
    this.dismiss(excludedTrackNames);
  }

  dismiss(data?: any) {
    // using the injected ViewController this page
    // can "dismiss" itself and pass back data
    this.viewCtrl.dismiss(data);
  }
}
