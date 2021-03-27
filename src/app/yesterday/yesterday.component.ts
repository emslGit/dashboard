import {Component} from '@angular/core';
import {Router} from '@angular/router'
import {CookieService} from 'ngx-cookie-service'
import {DashboardService} from '../dashboard.service'

@Component({
  selector: 'app-yesterday',
  templateUrl: './yesterday.component.html',
  styleUrls: ['./yesterday.component.sass']
})
export class YesterdayComponent {

  constructor(private router: Router, private cookieService: CookieService, public service: DashboardService) {}

  onEnter(yesterday: string) {
    if (yesterday) {
      this.cookieService.set('yesterday', yesterday, DashboardService.getExp())
      this.router.navigate(['/goal'])
    }
  }

  onSkip() {
    this.cookieService.set('yesterday', ' ', DashboardService.getExp())
    this.cookieService.set('goal', ' ', DashboardService.getExp())
    this.cookieService.set('checked', 'true', DashboardService.getExp())
    this.router.navigate(['/'])
  }
}
