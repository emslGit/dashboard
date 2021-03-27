import {Component} from '@angular/core'
import {DashboardService} from '../dashboard.service'

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.sass']
})
export class TimeComponent {

  constructor(public service: DashboardService) {}
}
