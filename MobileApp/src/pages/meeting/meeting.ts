import { NavController, ModalController, AlertController } from 'ionic-angular/index';
import { Component } from "@angular/core";
import * as moment from 'moment';
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

    constructor(public navCtrl: NavController, private modalCtrl: ModalController
        ,private alertCtrl: AlertController
    ) {
    }

    addEvent() {
        let modal = this.modalCtrl.create('EventModalPage', { selectedDay: this.selectedDay });
        modal.present();
       /*
       
        try {
            

        modal.onDidDismiss(addMeeting => {
            
            if (addMeeting) {
                let eventData = addMeeting;
                alert('Chandra - addEvent')
               // alert(new Date(JSON.parse(addMeeting).start_date.toString()));
               // alert(JSON.parse(addMeeting).end_time.toString());
              //  alert(JSON.parse(eventData));
                eventData.startTime = new Date(addMeeting.startTime);
                eventData.endTime = new Date(addMeeting.endTime);
               eventData.startTime = new Date(JSON.parse(addMeeting).start_date.toString());                                              
               eventData.endTime = new Date(JSON.parse(addMeeting).end_date.toString());

               eventData.startTime = JSON.parse(addMeeting).start_time.toString();
               eventData.startTime =JSON.parse(addMeeting).end_time.toString();
               
               
               alert('aaa');
               

                alert(eventData.start_time);
                
                let events = this.eventSource;
                alert(this.eventSource.length);
                events.push(eventData);
                this.eventSource = [];
                setTimeout(() => {
                    this.eventSource = events;
                }); 
            }
        }); 
    } catch (error) {
        console.log(error);
            
    }
    */
    }

    onEventSelected(event) {
        let start = moment(event.startTime).format('LLLL');
        let end = moment(event.endTime).format('LLLL');       
        let alert = this.alertCtrl.create({
            title: '' + event.title,
            subTitle: 'From: ' + start + '<br>To: ' + end,
            buttons: ['OK']
        })
        alert.present();
       // alert('onEventSelected');
    } 

    loadEvents() {
       // alert('loadEvents');
        this.eventSource = this.createRandomEvents();
    }

    onViewTitleChanged(title) {
        //alert('onViewTitleChanged');
        this.viewTitle = title;
    }

    changeMode(mode) {
       // alert('changeMode');
        this.calendar.mode = mode;
    }

    today() {
      //  alert('today');
        this.calendar.currentDate = new Date();
    }

    onTimeSelected(ev) {
     // alert('onTimeSelected');
        console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
            (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
    }
    

    onCurrentDateChanged(event: Date) {
       // alert('onCurrentDateChanged');
      this.selectedDay = new Date(Date.UTC(event.getUTCFullYear(), event.getUTCMonth(), event.getUTCDate()));;
        event.setDate;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        event.setHours(0, 0, 0, 0);
        this.isToday = today.getTime() === event.getTime();
       // this.isToday  = today.getTime();
    }


    createRandomEvents() {
        //alert('createRandomEvents');
        var events = [];
        
        for (var i = 0; i < 50; i += 1) {
            var date = new Date();
            var eventType = Math.floor(Math.random() * 2);
            var startDay = Math.floor(Math.random() * 90) - 45;
            var endDay = Math.floor(Math.random() * 2) + startDay;
            var startTime;
            var endTime;
            if (eventType === 0) {
                startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
                if (endDay === startDay) {
                    endDay += 1;
                }
                endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + endDay));
                events.push({
                    title: 'All Day - ' + i,
                    startTime: startTime,
                    endTime: endTime,
                    allDay: true
                });
            } else {
                var startMinute = Math.floor(Math.random() * 24 * 60);
                var endMinute = Math.floor(Math.random() * 180) + startMinute;
                startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + startDay, 0, date.getMinutes() + startMinute);
                endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + endDay, 0, date.getMinutes() + endMinute);
                events.push({
                    title: 'Event - ' + i,
                    startTime: startTime,
                    endTime: endTime,
                    allDay: false
                });
            }
        }
        return events;
    }

    onRangeChanged(ev) {
        //alert('onRangeChanged');
        console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
    }



    markDisabled = (date: Date) => {
       // alert('markDisabled');
        var current = new Date();
        current.setHours(0, 0, 0);
        return date < current;
    };
}