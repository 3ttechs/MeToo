import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import * as moment from 'moment';
import { of } from "rxjs/observable/of";
import { FeedbackProvider } from '../../providers/feedback-provider';  // where feeback provider will use for login screen  -- ChandraRao
import { DummyLoginProvider } from '../../providers/dummy-login-provider';
import { AddMeeting } from '../../interfaces/user-options';

@IonicPage()
@Component({
  selector: 'event-modal',
  templateUrl: 'event-modal.html',
})
export class EventModalPage {
  inputdataVal: any[0]; // ChandraRao
  AddContactSelectedEmails: string;
  lstEmails: Array<String> = [];
  userIds: string = '';
  addMeeting: AddMeeting = {
    title: '', notes: '', StartDate: '',
    EndDate: '', Location: '',
    Category_Type: '', 
    //All_Day: '',
    AddContact: [], email: []
  };

  data: any;
  event = {
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    allDay: false,
    room: {},

  };

  minDate = new Date().toISOString();
  rooms$ = of([{ id: "room1", name: "room1" }, { id: "room2", name: "room2" }, { id: "room3", name: "room3" }])
  selectedDay: string = '';


  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    public viewCtrl: ViewController,
    private feedbackProvider: FeedbackProvider,
    private loginProvider: DummyLoginProvider
  ) {
    let preselectedDate = moment(this.navParams.get('selectedDay')).format();
    //this.event.startTime = preselectedDate;
    //this.event.endTime = preselectedDate;
    this.addMeeting.StartDate = preselectedDate;
    this.addMeeting.EndDate = preselectedDate;
    this.onGetContactList();
  }

  onGetContactList() {
    //alert(this.loginProvider.UserId);
    let inputdata="user_id="+this.loginProvider.UserId;
    //let inputdata = "user_id=1";
    this.feedbackProvider.GetData(inputdata, "/get_contacts_list/").then(data => {
      this.inputdataVal = data;
    }).catch(function (error) {
      alert(JSON.stringify(error));
    });
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  GetOnlyDateformat(event: Date, DateFormatyyyyMMdd: string) {
    if (DateFormatyyyyMMdd === "yyyyMMdd") {
      return DateFormatyyyyMMdd = event.getUTCFullYear().toString() + "-" + event.getUTCMonth().toString() + "-" + event.getUTCDate();
    }
  }

  GetOnlyTimeformat(event: Date, DateFormatyyyyMMdd: string) {
    if (DateFormatyyyyMMdd === "HHmm") {

      var dateWithouthSecond = new Date(event);
      var hours = dateWithouthSecond.getHours() < 10 ? "0" + dateWithouthSecond.getHours() : dateWithouthSecond.getHours();
      var minutes = dateWithouthSecond.getMinutes() < 10 ? "0" + dateWithouthSecond.getMinutes() : dateWithouthSecond.getMinutes();
      var time = hours + ":" + minutes;
      return time;
      //return dateWithouthSecond.toLocaleTimeString(navigator.language, {  hour: '2-digit', minute: '2-digit' });
    }
  }

  save() {
     if (this.addMeeting.title === "") {
      this.feedbackProvider.showAlert("Please add title", "Add Meeting");
    }
    else if (this.addMeeting.notes === "") {
      this.feedbackProvider.showAlert("Please add notes", "Add Meeting");
    }
    else if (this.addMeeting.Location === "") {
      this.feedbackProvider.showAlert("Please add location", "Add Meeting");
    }
    else if (this.addMeeting.Category_Type === "") {
      this.feedbackProvider.showAlert("Please select Category/Type", "Add Meeting");
    }
    else if (this.lstEmails.length <= 0) {
      this.feedbackProvider.showAlert("Please select atleast one add contacts", "Add Meeting");
    } else {
      for (let i = 0; i <= this.lstEmails.length - 1; i++) {
        this.userIds += this.lstEmails[i] + ',';
      }

      this.userIds = this.userIds.substring(0, this.userIds.length - 1);
      var myStartdate = new Date(this.addMeeting.StartDate);
      var myEnddate = new Date(this.addMeeting.EndDate);
      // where organiser_id is nothing but this.loginProvider.UserId
      let AddMeetingData = JSON.stringify({
        organiser_id: this.loginProvider.UserId,
        title: this.addMeeting.title,
        category: this.addMeeting.Category_Type,
        venue: this.addMeeting.Location,
        notes: this.addMeeting.notes,
        //all_day: "0",
        start_date: this.GetOnlyDateformat(myStartdate, "yyyyMMdd"),
        end_date: this.GetOnlyDateformat(myEnddate, "yyyyMMdd"),
        start_time: this.GetOnlyTimeformat(myStartdate, "HHmm"),
        end_time: this.GetOnlyTimeformat(myEnddate, "HHmm"),
        attendee_ids: [this.userIds]
      });

      //alert(AddMeetingData);
      this.userIds="";

      this.feedbackProvider.PostData(AddMeetingData, "/add_meeting").then((result) => {
        this.data = result;
        //alert('aaaaaaaaaaa');
        //alert(result);
        //alert(this.data);
        if (this.data === 0) {
          this.feedbackProvider.showAlert('error', "Login");
        } else {
          this.inputdataVal = this.data;
          //alert('ssssssss');
          //alert(this.data);
          //alert(this.inputdataVal);
          //alert(JSON.stringify(this.inputdataVal['login_id']));
          // this.loginProvider.UserId=this.inputdataVal['login_id'];
          //this.navCtrl.push(TabsPage);
        }
      }).catch(function (error) {
        this.feedbackProvider.showAlert(JSON.stringify(error), "Error");
      });

      //alert('ssssssss');
    }
    //this.viewCtrl.dismiss(this.event);
  }

  blockDay($event) {
    console.log($event)
  }



  // cb_value: boolean;

  // updateCbValue() {
  //   console.log('Something new state:' + this.cb_value);
  // }
  //checked = [];
  addCheckbox(event, checkbox: String) {
    this.AddContactSelectedEmails = checkbox + ',';
    this.AddContactSelectedEmails = this.AddContactSelectedEmails.substring(0, this.AddContactSelectedEmails.length - 1);
    if (event.checked) {
      this.lstEmails.push(checkbox);
    } else {
      alert(this.AddContactSelectedEmails)
      let indexq = this.lstEmails.indexOf(this.AddContactSelectedEmails);
      alert(indexq)
      this.lstEmails.splice(indexq, 1);
    }
  }

  optionSelected($event) {
    console.log($event)
    this.event.room = $event
  }
}