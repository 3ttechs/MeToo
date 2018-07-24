import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { ConferenceApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { SchedulePage } from '../pages/schedule/schedule';
import { MeetingPage } from '../pages/meeting/meeting';
import { EventModalPage } from '../pages/event-modal/event-modal';


import { ScheduleFilterPage } from '../pages/schedule-filter/schedule-filter';
import { MeetingDetailPage } from '../pages/meeting-detail/meeting-detail';
import { SignupPage } from '../pages/signup/signup';
import { FeedbackPage } from '../pages/feedback/feedback';
import { TabsPage } from '../pages/tabs-page/tabs-page';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { VisionPage } from '../pages/vision/vision';
import { NotificationPage } from '../pages/notification/notification';
import { ContactsPage } from '../pages/contacts/contacts';

import { ContactProvider } from '../providers/contact-provider';
import { DummyLoginProvider } from '../providers/dummy-login-provider';
import { MeetingProvider } from '../providers/meeting-provider';
import { FeedbackProvider } from '../providers/feedback-provider';

import { UserData } from '../providers/user-data';
import { NgCalendarModule  } from 'ionic2-calendar';

import { Ionic2RatingModule } from 'ionic2-rating';
import {ForgotPasswordPage} from '../pages/forgot-password/forgot-password'


@NgModule({
  declarations: [
    ConferenceApp,
    LoginPage,
    MapPage,
    SchedulePage,
    MeetingPage,
    EventModalPage,    
    ScheduleFilterPage,
    MeetingDetailPage,
    SignupPage,
    FeedbackPage,
    TabsPage,
    TutorialPage,
    VisionPage,
    NotificationPage,
    ContactsPage,
    ForgotPasswordPage
  ],
  imports: [
    NgCalendarModule,
    BrowserModule,
    HttpModule,
    Ionic2RatingModule,
    IonicModule.forRoot(ConferenceApp, {}, {
      links: [
        { component: TabsPage, name: 'TabsPage', segment: 'tabs-page' },
        { component: MeetingPage, name: 'MeetingPage', segment: 'meeting' },    
        { component: EventModalPage, name: 'EventModalPage', segment: 'calendar-event' },           
        { component: SchedulePage, name: 'Schedule', segment: 'schedule' },
        { component: MeetingDetailPage, name: 'MeetingDetail', segment: 'meetingDetail/:meetingId' },
        { component: ScheduleFilterPage, name: 'ScheduleFilter', segment: 'scheduleFilter' },
        { component: FeedbackPage, name: 'FeedbackList', segment: 'speakerList' },
        { component: MapPage, name: 'MapPage', segment: 'map' },
        { component: TutorialPage, name: 'Tutorial', segment: 'tutorial' },
        { component: VisionPage, name: 'VisionPage', segment: 'support' },
        { component: NotificationPage, name: 'NotificationPage', segment: 'notification' },
        { component: ContactsPage, name: 'ContactsPage', segment: 'contacts' },

        { component: LoginPage, name: 'LoginPage', segment: 'login' },
        { component: SignupPage, name: 'SignupPage', segment: 'signup' }
            
      ]
    }),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ConferenceApp,
    LoginPage,
    MapPage,
    SchedulePage,
    MeetingPage,
    EventModalPage, 
    ScheduleFilterPage,
    MeetingDetailPage,
    SignupPage,
    FeedbackPage,
    TabsPage,
    TutorialPage,
    VisionPage,
    NotificationPage,
    ContactsPage,  
    ForgotPasswordPage 
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    MeetingProvider,
    ContactProvider,
    DummyLoginProvider,
    FeedbackProvider,
    UserData,
    InAppBrowser,
    SplashScreen
  ]
})
export class AppModule { }
