import {Injectable} from '@angular/core'
import {Storage} from 'aws-amplify'
import {CookieService} from 'ngx-cookie-service'
import {Router} from '@angular/router'

@Injectable({
  providedIn: 'root'
})

export class DashboardService {
  night: boolean
  time: Date
  authState: any
  user: any
  ref: any

  constructor(private router: Router, public cookieService: CookieService) {
    this.time = DashboardService.getTime()
    if (21 <= this.time.getHours() || this.time.getHours() <= 8) {
      this.night = true
    } else {
      this.night = false
    }

    setInterval(() => {
      this.time = DashboardService.getTime()
    }, 1000)
  }

  public static getTime() {
    const time = new Date()
    time.setTime(time.getTime() + 60 * 60 * 1000)
    return time
  }

  public static getExp() {
    const exp = new Date()
    exp.setTime(exp.getTime() + 60 * 60 * 1000)
    exp.setHours(23, 0, 0, 0)
    return exp
  }

  public static getExpLong(days: number) {
    const exp = new Date()
    exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000)
    return exp
  }

  public static getMidnight(days: number) {
    const date = DashboardService.getTime()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    date.setHours(0, 0, 0, 0)
    return date
  }

  public static getDateRange(startDate, endDate) {
    const dateArray = []
    const currentDate = new Date(startDate.getTime())
    while (currentDate <= endDate) {
      dateArray.push(new Date (currentDate))
      currentDate.setTime(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }
    return dateArray
  }

  public static strToDate(str: string) {
    if (str.length) {
      const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = str.substr(4, 3)
      const day = Number(str.substr(8, 2))
      const year = Number(str.substr(11, 4))
      return new Date(year, MON.indexOf(month), day)
    } else {
      return false
    }
  }

  public saveData() {
    Storage.put('data-2.json', JSON.stringify(this.cookieService.getAll())
      , {
        level: 'private',
        contentType: 'json'
      })
    alert('Data stored to cloud.')
  }

  public async loadData() {
    this.cookieService.deleteAll()
    const data = await Storage.get('data-2.json', {download: true})
    data['Body'].text().then(str => {
      const json = JSON.parse(str)
      for (const k in json) {
        if (!['goal', 'yesterday'].includes(k)) {
          this.cookieService.set(k, json[k], ['pomodoro', 'meals', 'checked'].includes(k) ? DashboardService.getExp() : DashboardService.getExpLong(30))
        }
      }
      if (this.router.url === '/') {
        location.reload()
      } else {
        this.router.navigate(['/'])
      }
    })
  }

  resetCookies() {
    this.cookieService.deleteAll()
    this.router.navigate(['yesterday'])
  }
}
