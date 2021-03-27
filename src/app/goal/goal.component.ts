import {Component} from '@angular/core'
import {Router} from '@angular/router'
import {CookieService} from 'ngx-cookie-service'
import {DashboardService} from '../dashboard.service'

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.sass']
})
export class GoalComponent {

  constructor(private router: Router, private cookieService: CookieService, public service: DashboardService) {}

  onEnter(goal: string) {
    if (goal) {
      this.cookieService.set('goal', goal, DashboardService.getExp())
      this.router.navigate(['/'])
    }
  }
}
