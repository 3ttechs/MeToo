import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { UserData } from './user-data';

let apiUrl = 'http://localhost:5000';

@Injectable()
export class MeetingProvider {
  data: any;

  private categories: string[] = ['Business', 'Personal'];

  private debug: any = false;
  constructor(public http: Http, public user: UserData) { }

  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('assets/data/data.json')
        .map(this.processData, this);
    }
  }

  processData(data: any) {
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.data = data.json();

    this.data.tracks = [];

    // loop through each day in the schedule
    this.data.schedule.forEach((day: any) => {
      // loop through each timeline group in the day
      day.groups.forEach((group: any) => {
        // loop through each session in the timeline group
        group.sessions.forEach((session: any) => {
          session.speakers = [];
          if (session.speakerNames) {
            session.speakerNames.forEach((speakerName: any) => {
              let speaker = this.data.speakers.find((s: any) => s.name === speakerName);
              if (speaker) {
                session.speakers.push(speaker);
                speaker.sessions = speaker.sessions || [];
                speaker.sessions.push(session);
              }
            });
          }

          if (session.tracks) {
            session.tracks.forEach((track: any) => {
              if (this.data.tracks.indexOf(track) < 0) {
                this.data.tracks.push(track);
              }
            });
          }
        });
      });
    });

    return this.data;
  }

  //tjv : getMeetingGroupsDataFromAllMeetings() will replace getTimeline()
  
  getTimeline(dayIndex: number, queryText = '', excludeTracks: any[] = [], segment = 'all') {
    return this.load().map((data: any) => {
      console.log('tjv...Inside getTimeline()');

      let day = data.schedule[dayIndex];
      day.shownSessions = 0;

      console.log('tjv...dayIndex : ' + dayIndex);
      console.log('tjv...excludeTracks.length : ' + excludeTracks.length);
      if(excludeTracks.length > 0)
      {
        console.log('excludeTracks[0] : ' + excludeTracks[0]);
      }
      console.log('tjv...segment : ' + segment);

      queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
      console.log('tjv...queryText : ' + queryText);
      let queryWords = queryText.split(' ').filter(w => !!w.trim().length);

      day.groups.forEach((group: any) => {
        console.log('tjv...group : ' + group.time);

        group.hide = true;

        group.sessions.forEach((session: any) => {
          // check if this session should show or not
          this.filterMeeting(session, queryWords, excludeTracks, segment);

          if (!session.hide) {
            // if this session is not hidden then this group should show
            group.hide = false;
            day.shownSessions++;
          }
        });

      });

      return day;
    });
  }
  
  public getMeetingListForUser(userId){
    return new Promise((resolve,reject) =>{
      this.http.get(apiUrl + '/get_meeting_list/user_id=' + userId)
        .subscribe(res=>{
          resolve(res.json());
        },(err) => {
          console.log(err);
          reject(err);
        });
    })
  }

  public getMeetingGroupsDataFromAllMeetings(allMeetings: any, queryText = '', excludeTracks: any[] = [], segment = 'all')
  {
    let meetingGroupsData = {groups: [], shownMeetingsCount: 0};

    let meetingHashTable = {};
    
    for(let i=0; i<allMeetings.length; i++)
    {
      let key = allMeetings[i].start_date;

      let mtg = {id : allMeetings[i].meeting_id, title : allMeetings[i].title, venue : allMeetings[i].venue,
                 startDate: allMeetings[i].start_date, startTime: allMeetings[i].start_time, endTime : allMeetings[i].end_time,
                 category : allMeetings[i].category, notes : allMeetings[i].notes, organiserId : allMeetings[i].organiser_id};

      if(meetingHashTable[key] == null)
      {
        meetingHashTable[key] = [];
      }
      else {}

      let len = meetingHashTable[key].length;
      meetingHashTable[key][len] = mtg;
    }

    if(this.debug)
      this.printMeetingHashTable(meetingHashTable);

    let meetingGroups = this.getMeetingGroups(meetingHashTable);
    if(this.debug)
      this.printMeetingGroups(meetingGroups);

    queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    let queryWords = queryText.split(' ').filter(w => !!w.trim().length);
    
    meetingGroups.forEach((meetingGroup: any) => {

      meetingGroup.hide = true;
      meetingGroup.meetings.forEach((mtg: any) => {
        
        // check if this session should show or not
        this.filterMeeting(mtg, queryWords, excludeTracks, segment);

        if (!mtg.hide) {
          // if this meeting is not hidden then this group should show
          meetingGroup.hide = false;
          meetingGroupsData.shownMeetingsCount++;
        }
      });
    });

    meetingGroupsData.groups = meetingGroups;
    return meetingGroupsData;
  }

  private getMeetingGroups(meetingHashTable: any)
  {
    let meetingGroups = [];
    let keys = Object.keys(meetingHashTable);

    for(let i=0; i<keys.length; i++)
    {
      let key = keys[i];
      //let meetingGroup = {StartDate : key, meetings : meetingHashTable[key]};
      //let meetingGroup = {time : key, meetings : meetingHashTable[key]};
      let meetingGroup = {time : key, meetings : meetingHashTable[key], hide : true};
      meetingGroups[i] = meetingGroup;
    }

    return meetingGroups;
  }

  private printMeetingHashTable(meetingHashTable: any)
  {
    console.log("Printing Meeting HashTable...");
    let keys = Object.keys(meetingHashTable);
    for(let i=0; i<keys.length; i++)
    {
      let key = keys[i];
      let len = meetingHashTable[key].length;
      
      console.log('Date : ' + key);
      for(let j=0; j<len; j++)
      {
        let mtg = meetingHashTable[key][j];
        console.log(mtg.Title + '...' + mtg.Venue);
      }
    }
  }

  private printMeetingGroups(meetingGroups: any)
  {
    console.log("Printing Meeting Groups...");
    for(let i=0; i<meetingGroups.length; i++)
    {
      let meetingGroup = meetingGroups[i];
      
      let len = meetingGroup.meetings.length;
      
      console.log('Date : ' + meetingGroup.time);
      for(let j=0; j<len; j++)
      {
        let mtg = meetingGroup.meetings[j];
        console.log(mtg.title + '...' + mtg.venue + '...' + mtg.category);
      }
    }
  }

  filterMeeting(meeting: any, queryWords: string[], excludeCategories: any[], segment: string) {
    console.log('segment : ' + segment);
    let matchesQueryText = false;
    if (queryWords.length) {
      // of any query word is in the meeting title than it passes the query test
      queryWords.forEach((queryWord: string) => {
        if (meeting.title.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }
      });
    } else {
      // if there are no query words then this meeting passes the query test
      matchesQueryText = true;
    }

    let matchesCategory = false;
    if (excludeCategories.indexOf(meeting.category) === -1) //item not found
    { 
      matchesCategory = true;
    }

    // if the segement is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    //let matchesSegment = false;

    //tjv blocked for testing
    /*
    if (segment === 'favorites') {
      if (this.user.hasFavorite(session.name)) {
        matchesSegment = true;
      }
    } else {
      matchesSegment = true;
    }
    */

    // all tests must be true if it should not be hidden
    //session.hide = !(matchesQueryText && matchesTracks && matchesSegment);
      meeting.hide = !(matchesQueryText && matchesCategory);
    /*
    if(matchesQueryText && matchesTracks && matchesSegment))
    {
      session.hide  = false; //show
    }
    */
  }

  getSpeakers() {
    return this.load().map((data: any) => {
      return data.speakers.sort((a: any, b: any) => {
        let aName = a.name.split(' ').pop();
        let bName = b.name.split(' ').pop();
        return aName.localeCompare(bName);
      });
    });
  }
 
  getCategories() {
    return this.categories.slice();
  }

  getMap() {
    return this.load().map((data: any) => {
      return data.map;
    });
  }

}
