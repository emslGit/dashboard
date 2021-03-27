import {Component, Input} from '@angular/core'
import {DashboardService} from '../dashboard.service'
import {Router} from '@angular/router'

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.sass']
})

export class NavComponent {
  @Input() pages: string[]
  urls = {
    dashboard: '/',
    habits: 'habits',
    dictionary: 'dictionary'
  }

  constructor(private router: Router, public service: DashboardService) {}

  toggleNightMode() {
    this.service.night = !this.service.night
  }

  navigate(path: string) {
    this.router.navigate([path])
  }
}
