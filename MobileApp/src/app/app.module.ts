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
import { SessionDetailPage } from '../pages/session-detail/session-detail';
import { SignupPage } from '../pages/signup/signup';
import { FeedbackPage } from '../pages/feedback/feedback';
import { TabsPage } from '../pages/tabs-page/tabs-page';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { VisionPage } from '../pages/vision/vision';

import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
import { NgCalendarModule  } from 'ionic2-calendar';

@NgModule({
  declarations: [
    ConferenceApp,
    LoginPage,
    MapPage,
    SchedulePage,
    MeetingPage,
    EventModalPage,    
    ScheduleFilterPage,
    SessionDetailPage,
    SignupPage,
    FeedbackPage,
    TabsPage,
    TutorialPage,
    VisionPage
  ],
  imports: [
    NgCalendarModule,
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(ConferenceApp, {}, {
      links: [
        { component: TabsPage, name: 'TabsPage', segment: 'tabs-page' },
        { component: MeetingPage, name: 'MeetingPage', segment: 'meeting' },    
        { component: EventModalPage, name: 'EventModalPage', segment: 'calendar-event' },           
        { component: SchedulePage, name: 'Schedule', segment: 'schedule' },
        { component: SessionDetailPage, name: 'SessionDetail', segment: 'sessionDetail/:sessionId' },
        { component: ScheduleFilterPage, name: 'ScheduleFilter', segment: 'scheduleFilter' },
        { component: FeedbackPage, name: 'FeedbackList', segment: 'speakerList' },
        { component: MapPage, name: 'Map', segment: 'map' },
        { component: TutorialPage, name: 'Tutorial', segment: 'tutorial' },
        { component: VisionPage, name: 'VisionPage', segment: 'support' },
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
    SessionDetailPage,
    SignupPage,
    FeedbackPage,
    TabsPage,
    TutorialPage,
    VisionPage
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ConferenceData,
    UserData,
    InAppBrowser,
    SplashScreen
  ]
})
export class AppModule { }
