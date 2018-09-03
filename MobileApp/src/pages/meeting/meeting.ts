import { NavController, ModalController, AlertController } from 'ionic-angular/index';
import { Component } from "@angular/core";
import * as moment from 'moment';
import { FeedbackProvider } from '../../providers/feedback-provider'; 
import { DummyLoginProvider } from '../../providers/dummy-login-provider';
//"moment": "^2.22.2",
//    "rxjs": "5.5.2",

export interface Config {
	technologies: string;
}
@Component({
    templateUrl: "meeting.html"
    
})
export class MeetingPage { 
    eventSource = [];
    viewTitle;
    selectedDay = new Date();

    isToday: boolean;
    calendar = {
        mode: 'month',
        currentDate: new Date(),
        dateFormatter: {
            formatMonthViewDay: function (date: Date) {
                return date.getDate().toString();
            },
            formatMonthViewDayHeader: function () {
                return 'MonMH';
            },
            formatMonthViewTitle: function () {
                return 'testMT';
            },
            formatWeekViewDayHeader: function () {
                return 'MonWH';
            },
            formatWeekViewTitle: function () {
                return 'testWT';
            },
            formatWeekViewHourColumn: function () {
                return 'testWH';
            },
            formatDayViewHourColumn: function () {
                return 'testDH';
            },
            formatDayViewTitle: function () {
                return 'testDT';
            }
        }
    };
    
    inputdataVal: any;

    constructor(public navCtrl: NavController, private modalCtrl: ModalController,private alertCtrl: AlertController,private feedbackProvider: FeedbackProvider, private loginProvider: DummyLoginProvider
        ) {
        console.log('constructor call');
        this.eventSource = this.createRandomEvents();
        console.log('constructor ');
    }
    

    addEvent() {
        try {
        let modal = this.modalCtrl.create('EventModalPage', { selectedDay: this.selectedDay });
        modal.present();
        // modal.onDidDismiss(data => {
        //     if (data) {
        //         let eventData = data;

        //         eventData.startTime = new Date(data.startTime);
        //         eventData.endTime = new Date(data.endTime);

        //         let events = this.eventSource;
        //         events.push(eventData);
        //         this.eventSource = [];
        //         setTimeout(() => {
        //             this.eventSource = events;
        //         });
        //     }
        // });
        //this.eventSource = this.createRandomEvents();
        modal.onDidDismiss(addMeeting => {
            if (addMeeting) {
                let eventData = addMeeting;
                alert(addMeeting.startTime);
                eventData.startTime = new Date(addMeeting.startTime);
                eventData.endTime = new Date(addMeeting.endTime);
                alert('chandra -- eventSource');
                let events = this.eventSource;
                events.push(eventData);

                this.eventSource = [];
                alert(this.eventSource.length);
                setTimeout(() => {
                    this.eventSource = events;
                    console.log(events);
                    alert(this.eventSource.length);
                }); 
            }
        }); 
    } catch (error) {
            console.log('My Error' + error);
    }
    this.eventSource = this.createRandomEvents();
    }
    
    onEventSelected(addMeeting) {
        try{
        let start = moment(addMeeting.startTime).format('LLLL');
        let end = moment(addMeeting.endTime).format('LLLL');       
        let alert = this.alertCtrl.create({
            title: 'Details' ,
            subTitle: 'From: ' + start + '<br>To: ' + end,
            buttons: ['OK']
        })
        alert.present();
    } catch (error) {
          console.log(error);
    }
    } 

    loadEvents() {
       // alert('loadEvents');
        this.eventSource = this.createRandomEvents();
    }

    onViewTitleChanged(title) {
       
        this.viewTitle = title;
    }

    changeMode(mode) {
       
        this.calendar.mode = mode;
    }

    today() {
      
        this.calendar.currentDate = new Date();
    }

    onTimeSelected(ev) {
        try{
      //alert('onTimeSelected');
        console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
            (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
        } catch (error) {
            console.log(error);
      }
  
    }
    

    onCurrentDateChanged(event: Date) {
try{
   // alert('onCurrentDateChanged');
      this.selectedDay = new Date(Date.UTC(event.getUTCFullYear(), event.getUTCMonth(), event.getUTCDate()));
        event.setDate;
        console.log("onCurrentDateChanged event.setDate : "+event.setDate);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        event.setHours(0, 0, 0, 0);
        this.isToday = today.getTime() === event.getTime();
        
        console.log("onCurrentDateChanged : "+this.isToday);
       // this.isToday  = today.getTime();
    } catch (error) {
        console.log(error);
  }

    }


    createRandomEvents() {
       var events = [];
         let inputdata="user_id="+this.loginProvider.UserId;
         //let inputdata = "user_id=1";
         this.feedbackProvider.GetData(inputdata, "/get_meeting_list/").then(data => {
           this.inputdataVal = data;
           

        for (var i = 0; i < JSON.parse(JSON.stringify(this.inputdataVal)).length; i += 1) {

            var date = new Date(JSON.parse(JSON.stringify(data))[i].start_date);
            var eventType =1;// Math.floor(Math.random() * 2);
            var startDay =date.getUTCDate();// Math.floor(Math.random() * 90) - 45;
            var endDay =date.getUTCDate();// Math.floor(Math.random() * 2) + startDay;
            var startTime;
            var endTime;
            if (eventType === 0) {
                //startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
                startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(),16,30);
                console.log("Staer Time -- Chandra"+startTime);
                console.log(JSON.parse(JSON.stringify(data))[i].end_time);
                if (endDay === startDay) {
                    endDay += 1;
                }
                console.log("endDay -- Chandra : "+endDay);
                console.log("startDay -- Chandra : "+startDay);
                console.log("startTime -- Chandra : "+JSON.parse(JSON.stringify(data))[i].start_time);
                console.log("EndTime -- Chandra : "+JSON.parse(JSON.stringify(data))[i].end_time);
                //endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + endDay));
                endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(),15,30);
                console.log("end Time -- Chandra : "+endTime);
                events.push({
                    //title: 'All Day - ' + i,
                    title: JSON.parse(JSON.stringify(data))[i].title,
                    startTime: startTime,
                    endTime: endTime,
                    color: "Business"
                    //,allDay: true
                });
            } else {
                //var startMinute = Math.floor(Math.random() * 24 * 60);
                //var endMinute = Math.floor(Math.random() * 180) + startMinute;
                //startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + startDay, 0, date.getMinutes() + startMinute);
                //endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + endDay, 0, date.getMinutes() + endMinute);
                var startTimeVal=JSON.parse(JSON.stringify(data))[i].start_time;
                var endTimeVal=JSON.parse(JSON.stringify(data))[i].end_time;
                startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() , Number(startTimeVal.substring(0,2)),Number(startTimeVal.substring(3,5)));
                endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(endTimeVal.substring(0,2)),Number(endTimeVal.substring(3,5)));
                
                console.log("EndTime -- Chandra : "+JSON.parse(JSON.stringify(data))[i].start_time);
                console.log( Number(startTimeVal.substring(0,2)));
                console.log( Number(startTimeVal.substring(3,5)));
                console.log("EndTime -- Chandra : "+JSON.parse(JSON.stringify(data))[i].end_time);

                events.push({
                    //title: 'Event - ChandraRao - ' + i,
                    title:JSON.parse(JSON.stringify(data))[i].title,
                    startTime: startTime,
                    endTime: endTime,
                    subTitle:JSON.parse(JSON.stringify(data))[i].notes +" - "+JSON.parse(JSON.stringify(data))[i].category
                    //,allDay: false
                });
            }
        }
    }).catch(function (error) {
        alert(JSON.stringify(error));
       });
        return events;   
    }

    onRangeChanged(ev) {
        //alert('onRangeChanged');
        try{
        console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
    } catch (error) {
        console.log(error);
  }

    }



    markDisabled = (date: Date) => {
        alert('markDisabled');
        var current = new Date();
        current.setHours(0, 0, 0);
        return date < current;
    };
}
