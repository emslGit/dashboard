import {BrowserModule} from '@angular/platform-browser'
import {NgModule} from '@angular/core'
import {QuillModule} from 'ngx-quill'
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'
import {FormsModule} from '@angular/forms'
import {HttpClientModule} from '@angular/common/http'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {MatNativeDateModule} from '@angular/material/core'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatIconModule} from '@angular/material/icon'
import {MatFormFieldModule} from '@angular/material/form-field'
import {AppRoutingModule} from './app-routing.module'

import {MinuteSecondsPipe} from '../pipes/minsec'
import {AppComponent} from './app.component'
import {GoalComponent} from './goal/goal.component'
import {DashboardComponent} from './dashboard/dashboard.component'
import {YesterdayComponent} from './yesterday/yesterday.component'
import {DictionaryComponent} from './dictionary/dictionary.component'
import {NavComponent} from './nav/nav.component'
import {TimeComponent} from './time/time.component'
import {HabitsComponent} from './habits/habits.component'
import {CookieService} from 'ngx-cookie-service'

import {CapitalizePipe} from '../pipes/capitalize'
import {HabitStatusPipe} from '../pipes/status'

import {AmplifyUIAngularModule} from '@aws-amplify/ui-angular'
import Amplify, {Storage} from 'aws-amplify'
import awsconfig from '../aws-exports.js'

Amplify.configure(awsconfig)
Storage.configure({ level: 'private' })

@NgModule({
  declarations: [
    AppComponent,
    GoalComponent,
    DashboardComponent,
    YesterdayComponent,
    DictionaryComponent,
    NavComponent,
    TimeComponent,
    HabitsComponent,

    // pipes
    MinuteSecondsPipe,
    CapitalizePipe,
    HabitStatusPipe,
  ],
  imports: [
    AmplifyUIAngularModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    QuillModule.forRoot(),
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
