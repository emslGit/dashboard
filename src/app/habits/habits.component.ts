import {Component} from '@angular/core'
import {DashboardService} from '../dashboard.service'
import {CookieService} from 'ngx-cookie-service'
import {Router} from '@angular/router'

type Habit = {
  name: string
  days: boolean[]
  status: number[]
}

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.sass']
})
export class HabitsComponent {
  DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  startDate: Date
  endDate: Date
  today: Date
  cycle: string
  failures: string
  habits: Habit[] = []
  dateRange: Date[] = []
  pickedDates: boolean[] = Array(14).fill(true)
  showPicker = true

  constructor(private router: Router, public service: DashboardService, public cookieService: CookieService) {
    this.today = DashboardService.getMidnight(0)
    this.restoreCookies()
  }

  restoreCookies() {
    if (this.service.cookieService.get('yesterday') === '' || null) {
      this.router.navigate(['yesterday'])
    }
    this.startDate = DashboardService.strToDate(this.cookieService.get('startDate')) || DashboardService.getMidnight(0)
    this.endDate = DashboardService.strToDate(this.cookieService.get('endDate')) || DashboardService.getMidnight(13)
    if (this.today.getDate() > this.endDate.getDate() || this.today.getMonth() > this.endDate.getMonth()) {
      this.startCycle()
    }
    this.dateRange = DashboardService.getDateRange(this.startDate, this.endDate)
    this.cycle = this.cookieService.get(`${this.getStartKey()}_cycle`) || ''
    this.failures = this.cookieService.get(`${this.getStartKey()}_failures`) || ''
    this.habits = JSON.parse(this.cookieService.get(`${this.getStartKey()}_habits`) || '[]')
  }

  startCycle() {
    this.startDate = DashboardService.getMidnight(0)
    this.endDate = DashboardService.getMidnight(13)
    this.cookieService.set('startDate', this.startDate.toString(), DashboardService.getExpLong(30))
    this.cookieService.set('endDate', this.endDate.toString(), DashboardService.getExpLong(30))
  }

  textChanged(e: Event) {
    this[e.target['id']] = document.getElementById(e.target['id'])['value']
    this.cookieService.set(`${this.getStartKey()}_${e.target['id']}`, this[e.target['id']], DashboardService.getExpLong(30))
  }

  addHabit() {
    const habitInput = document.getElementById('habitbox')['value']
    if (habitInput[0] && this.habits.length <= 15) {
      this.habits.push({
        name: habitInput,
        days: this.pickedDates.slice(),
        status: Array(14).fill(0)
      })
      document.getElementById('habitbox')['value'] = ''
      this.cookieService.set(`${this.getStartKey()}_habits`, JSON.stringify(this.habits), DashboardService.getExpLong(30))
    }
  }

  removeHabit(i: number) {
    if (i > -1) {
      this.habits.splice(i, 1)
      this.cookieService.set(`${this.getStartKey()}_habits`, JSON.stringify(this.habits), DashboardService.getExpLong(30))
    }
  }

  dateFilter(date: Date) {
    const today = DashboardService.getTime()
    const later = DashboardService.getTime()
    later.setTime(later.getTime() + 14 * 24 * 60 * 60 * 1000)
    later.setHours(23, 0, 0, 0)
    return date >= today && date <= later
  }

  changeStatus(day: number, habit: number) {
    this.habits[habit].status[day] = (this.habits[habit].status[day] + 1) % 4
    this.cookieService.set(`${this.getStartKey()}_habits`, JSON.stringify(this.habits), DashboardService.getExpLong(30))
  }

  pickDate(date: number) {
    this.pickedDates[date] = !this.pickedDates[date]
    const element = document.getElementById(`date-picker-${date}`)
    if (this.pickedDates[date]) {
      element.classList.add('selected')
    } else {
      element.classList.remove('selected')
    }
  }

  back() {
    this.endDate.setTime(this.endDate.getTime() - 14 * 24 * 60 * 60 * 1000)
    this.startDate.setTime(this.startDate.getTime() - 14 * 24 * 60 * 60 * 1000)
    this.dateRange = DashboardService.getDateRange(this.startDate, this.endDate)
    this.cycle = this.cookieService.get(`${this.getStartKey()}_cycle`) || ''
    this.failures = this.cookieService.get(`${this.getStartKey()}_failures`) || ''
    this.habits = JSON.parse(this.cookieService.get(`${this.getStartKey()}_habits`) || '[]')
  }

  next() {
    this.endDate.setTime(this.endDate.getTime() + 14 * 24 * 60 * 60 * 1000)
    this.startDate.setTime(this.startDate.getTime() + 14 * 24 * 60 * 60 * 1000)
    this.dateRange = DashboardService.getDateRange(this.startDate, this.endDate)
    this.cycle = this.cookieService.get(`${this.getStartKey()}_cycle`) || ''
    this.failures = this.cookieService.get(`${this.getStartKey()}_failures`) || ''
    this.habits = JSON.parse(this.cookieService.get(`${this.getStartKey()}_habits`) || '[]')
  }

  getStartKey() {
    return `${this.startDate.getDate()}/${this.startDate.getMonth() + 1}/${this.startDate.getFullYear()}`
  }
}
