import {ChangeDetectorRef, Component, OnInit} from '@angular/core'
import {AuthState, CognitoUserInterface, onAuthUIStateChange} from '@aws-amplify/ui-components'
import {DashboardService} from './dashboard.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'dashboard'
  user: CognitoUserInterface | undefined
  authState: AuthState

  constructor(public service: DashboardService, private ref: ChangeDetectorRef) {}

  ngOnInit() {
    onAuthUIStateChange((authState, authData) => {
      this.service.authState = authState
      this.service.user = authData as CognitoUserInterface
      this.ref.detectChanges()
    })
  }
}
