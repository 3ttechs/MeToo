import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import * as moment from 'moment';
//import { of } from "rxjs/observable/of";
import { FeedbackProvider } from '../../providers/feedback-provider';  // where feeback provider will use for login screen  -- ChandraRao
import { DummyLoginProvider } from '../../providers/dummy-login-provider';
//import { AddMeeting } from '../../interfaces/user-options';
//import { TabsPage } from '../tabs-page/tabs-page';
//import { SchedulePage } from '../schedule/schedule';
//import { MeetingPage } from '../meeting/meeting';

@IonicPage()
@Component({
  selector: 'event-modal',
  templateUrl: 'event-modal.html',
})
export class EventModalPage {
   optVal: any[0];
  
  inputdataVal: any[0]; // ChandraRao
  AddContactSelectedEmails: string;
  lstEmails: Array<String> = [];
  userIds: string = '';
  /*addMeeting: AddMeeting = {
    title: '',
    notes: '',
    startDate: '',
    endDate: '',
    Location: '',
    Category_Type: '',
    //All_Day: '',
    AddContact: [],
    email: [],
    startTime: '',
    endTime: ''
  };*/

  errMsg: string = '';
  Mydata: any;
  data: any;

  event1 = {
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    allDay: false,
    room: {}
  };

  event = {
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    allDay: false,
    room: {},
    title: '',
    notes: '',
    startDate: '',
    endDate: '',
    Location: '',
    Category_Type: '',
    //All_Day: '',
    AddContact: [],
    email: []

  };

  

  minDate = new Date().toISOString();
  //rooms$ = of([{ id: "room1", name: "room1" }, { id: "room2", name: "room2" }, { id: "room3", name: "room3" }])
  selectedDay: string = '';
  AddMeetingDataGetArg: string = '';
  addMeeting: any;

  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    public viewCtrl: ViewController,
    private feedbackProvider: FeedbackProvider,
    private loginProvider: DummyLoginProvider
  ) {
    let preselectedDate = moment(this.navParams.get('selectedDay')).format();
    console.log(preselectedDate);
    console.log(preselectedDate);
    // this.event.startTime = preselectedDate;
    // this.event.endTime = preselectedDate;
    this.event.startDate = preselectedDate;
    this.event.endDate = preselectedDate;
    console.log(this.event.startTime);
    console.log(this.event.endTime);
    //this.addMeeting.startTime = preselectedDate;
    //this.addMeeting.endTime = preselectedDate;
    this.onGetContactList();
  }
ionViewwillUnload()
{
  console.log('ionViewwillUnload.........');
}
  onGetContactList() {
    //alert(this.loginProvider.UserId);

    //this.optVal=[{Business:"Business",Personal:"Personal"}];
    this.optVal=[{
      key: "Business",
      value: "Business"
    },
    {
      key: "Personal",
      value: "Personal"
    },
    ]
    
    let inputdata = "user_id=" + this.loginProvider.UserId;
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
      let MonthVal = event.getUTCMonth() + 1;
      return DateFormatyyyyMMdd = event.getUTCFullYear().toString() + "-" + MonthVal + "-" + event.getUTCDate();
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
    if (this.event.title === "") {
      this.feedbackProvider.showAlert("Please add title", "Add Meeting");
    }
    else if (this.event.notes === "") {
      this.feedbackProvider.showAlert("Please add notes", "Add Meeting");
    }
    else if (this.event.Location === "") {
      this.feedbackProvider.showAlert("Please add location", "Add Meeting");
    }
    else if (this.event.Category_Type === "") {
      this.feedbackProvider.showAlert("Please select Category/Type", "Add Meeting");
    }
    else if (this.lstEmails.length <= 0) {
      this.feedbackProvider.showAlert("Please select atleast one add contacts", "Add Meeting");
    } else {
      // this.feedbackProvider.showAlert("Please select atleast one add contacts", "Add Meeting");
      var blnVal = 1;
      this.userIds = this.userIds.substring(0, this.userIds.length - 1);
      var myStartdate = new Date(this.event.startDate);
      var myEnddate = new Date(this.event.endDate);

      this.AddMeetingDataGetArg =
        "organiser_id=" + this.loginProvider.UserId +
        ",start_date=" + this.GetOnlyDateformat(myStartdate, "yyyyMMdd") +
        ",start_time=" + this.GetOnlyTimeformat(myStartdate, "HHmm") +
        ",end_date=" + this.GetOnlyDateformat(myEnddate, "yyyyMMdd") +
        ",end_time=" + this.GetOnlyTimeformat(myEnddate, "HHmm");
      try {
        // this.feedbackProvider.showAlert( this.AddMeetingDataGetArg,"aaa");
        this.feedbackProvider.GetData(this.AddMeetingDataGetArg, "/add_meeting_validation/").then((result) => {
          this.Mydata = result;
          this.errMsg = this.Mydata.toString();


          if (this.errMsg.toString().substring(0, 5) === "Error") {
            this.feedbackProvider.showAlert(this.Mydata, "");
            blnVal = 1;
          }
          else {
            this.feedbackProvider.showAlert(this.Mydata, "");
            // alert(blnVal);
            this.AddMeetingDetails();
          }

        }).catch(function (error) {
          // this.feedbackProvider.showAlert(JSON.stringify(error), "Error");
          console.log(error);
        });


      } catch (error) {
        console.log(error);
        //this.feedbackProvider.showAlert( this.AddMeetingDataGetArg,"my"); 
      }

    }
    //this.viewCtrl.dismiss(this.addMeeting.AddContact);
    // this.viewCtrl.dismiss(this.event);
  }

  private AddMeetingDetails() {
    try {


      for (let i = 0; i <= this.lstEmails.length - 1; i++) {
        this.userIds += this.lstEmails[i] + ',';
      }

      this.userIds = this.userIds.substring(0, this.userIds.length - 1);
      var myStartdate = new Date(this.event.startDate);
      var myEnddate = new Date(this.event.endDate);
      // where organiser_id is nothing but this.loginProvider.UserId
      let AddMeetingData = JSON.stringify({
        organiser_id: this.loginProvider.UserId,
        title: this.event.title,
        category: this.event.Category_Type,
        venue: this.event.Location,
        notes: this.event.notes,
        //all_day: "0",
        start_date: this.GetOnlyDateformat(myStartdate, "yyyyMMdd"),
        end_date: this.GetOnlyDateformat(myEnddate, "yyyyMMdd"),
        start_time: this.GetOnlyTimeformat(myStartdate, "HHmm"),
        end_time: this.GetOnlyTimeformat(myEnddate, "HHmm"),
        attendee_ids: [this.userIds]
      });

      this.data = AddMeetingData;
      //alert(AddMeetingData);
      this.userIds = ""; 

      this.feedbackProvider.PostData(AddMeetingData, "/add_meeting").then((result) => {
        this.Mydata = result;
        this.inputdataVal = this.Mydata;
        if (this.Mydata === 0) {
          this.feedbackProvider.showAlert('error', "Meeting Details");
        } else {
          if (JSON.parse(JSON.stringify(this.Mydata)).status.toString() === "ERROR") {
            this.feedbackProvider.showAlert(JSON.parse(JSON.stringify(this.Mydata)).message.toString(),
              JSON.parse(JSON.stringify(this.Mydata)).status.toString());
            //this.viewCtrl.dismiss(this.data);
            //this.viewCtrl.dismiss(this.addMeeting.AddContact);
            //alert('if condition');
          } else {
            //alert('else condition');
            //this.navCtrl.pop();
            //this.viewCtrl.dismiss(this.event);
            this.viewCtrl.dismiss(this.event1);
            //this.viewCtrl.dismiss(this.data);
          }
        }
        //alert('My Testing');
        // this.navCtrl.push(MeetingPage);

      }).catch(function (error) {
        console.log('function' + error);
        // this.navCtrl.push(MeetingPage);
        //this.viewCtrl.dismiss(this.event);
      });
      //alert('My adfsad');
      //this.navCtrl.pop();
      // this.navCtrl.push(SchedulePage);
    } catch (error) {
      console.log('My Error' + error);
    }

    this.navCtrl.pop();
  }

  blockDay($event) {
    console.log($event)
  }


  addCheckbox(addMeeting, checkbox: String) {
    this.AddContactSelectedEmails = checkbox + ',';
    this.AddContactSelectedEmails = this.AddContactSelectedEmails.substring(0, this.AddContactSelectedEmails.length - 1);
    if (addMeeting.checked) {
      this.lstEmails.push(checkbox);
    } else {
      let indexq = this.lstEmails.indexOf(this.AddContactSelectedEmails);
      this.lstEmails.splice(indexq, 1);
    }
  }

  optionSelected($event) {
    console.log($event)
    this.event.room = $event
  }
}