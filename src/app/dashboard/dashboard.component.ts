import {Component} from '@angular/core'
import {Observable, Subject} from 'rxjs'
import {debounceTime, distinctUntilChanged, map, filter} from 'rxjs/operators'
import {CookieService} from 'ngx-cookie-service'
import {Router} from '@angular/router'
import {jsPDF} from 'jspdf'
import {HttpClient} from '@angular/common/http'
import {DashboardService} from '../dashboard.service'

type Meal = {
    Meal: string,
    Info: string,
    kCal: number,
    Protein: number,
    Category: string
}

const allMeals: Meal[] = []

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent {
  userArray: Meal[] = []
  notes: string[]
  notesStreams: Subject<Event>[]
  goal: string
  yesterday: string
  pomodoroGoal: string
  pomodoroTime: number
  carousel: number
  meals: Meal[] = []
  model: Meal
  todos: string[] = []
  todosStatus: boolean[] = []
  info: {}
  time: Date
  checked: boolean
  more: boolean
  modules = [
    {toolbar: [
        ['bold', 'italic'],
        [{ color: [] }],
        ['code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        [{ size: [false, 'large']}],
      ]},
    {toolbar: [
        [{ size: [false, 'large']}],
        ['bold'],
      ]}
  ]

  constructor(private router: Router, private cookieService: CookieService, private http: HttpClient, public service: DashboardService) {
    if (!allMeals.length) {
      DashboardComponent.parseCsvMeals('assets/Tracker.csv', http)
    }
    this.restoreCookies()
    this.more = false

    this.notesStreams = [new Subject<Event>(), new Subject<Event>()]
    for (let i = 0; i <= 1; i++) {
      this.notesStreams[i].asObservable().pipe(debounceTime(300)).subscribe(x => {
        next: {
          this.notes[i] = (x || '').toString()
          this.service.cookieService.set(`notes_${i}`, (x || '').toString(), DashboardService.getExpLong(30))
        }
      })
    }

    setInterval(() => {
      if (this.pomodoroGoal && this.pomodoroTime > 1) {
        this.pomodoroTime -= 1
        this.service.cookieService.set('pomodoroTime', this.pomodoroTime.toString())
      } else {
        this.pomodoroGoal = ''
      }
    }, 1000)
  }

  public static parseCsvMeals(url: string, http: HttpClient) {
    http.get(url, {responseType: 'text'}).toPromise().then(data => {
      const csvToRowArray = data.replace(/;;;\r/g, '').split('\n')
      for (let i = 1; i < csvToRowArray.length - 1; i++) {
        const row = csvToRowArray[i].split(';')
        if (row[0]) {
          allMeals.push({
            Meal: row[0],
            Info: row[1] || 'No information available.',
            kCal: Number(row[2]),
            Protein: Number(row[3]),
            Category: row[5]
          })
        }
      }
    })
  }

  formatter(meal) {
    return meal['Meal']
  }

  restoreCookies() {
    if (this.service.cookieService.get('yesterday') === '' || null) {
      this.router.navigate(['yesterday'])
    }
    this.notes = [this.service.cookieService.get(`notes_0`) || '', this.service.cookieService.get(`notes_1`) || '']
    this.goal = this.service.cookieService.get('goal')
    this.yesterday = this.service.cookieService.get('yesterday')
    this.meals = JSON.parse(this.service.cookieService.get('meals') || '[]')
    this.todos = JSON.parse(this.service.cookieService.get('todos') || '[]')
    this.checked = this.service.cookieService.get('checked') === 'true' || false
    this.carousel = Number(this.service.cookieService.get('carousel')) || 0
    this.pomodoroGoal = this.service.cookieService.get('pomodoroGoal') || ''
    this.pomodoroTime = Number(this.service.cookieService.get('pomodoroTime')) || 0
    const todoStatusUnparsed: string = this.service.cookieService.get('todosStatus')
    if (todoStatusUnparsed.length) {
      this.todosStatus = todoStatusUnparsed.substr(1, todoStatusUnparsed.length - 2).split(',').map(s => s === 'true')
    } else {
      this.todosStatus = []
    }
  }

  restart() {
    this.service.cookieService.delete('goal')
    this.service.cookieService.delete('yesterday')
    this.router.navigate(['yesterday'])
  }

  notesChanged(e: Event, i: number) {
    this.notesStreams[i].next(e['html'])
  }

  search(text: Observable<string>) {
    return text.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      filter(term => term.length >= 1),
      map(term => allMeals.filter(meal => new RegExp(term, 'mi').test(meal.Meal)).slice(0, 10))
    )
  }

  onPomodoroEnter(pomodoroGoal: string, minutes: number) {
    if (pomodoroGoal) {
      const time = new Date()
      time.setTime(time.getTime() + minutes * 60 * 1000)
      this.pomodoroGoal = pomodoroGoal
      this.pomodoroTime = minutes * 60
      this.service.cookieService.set('pomodoroGoal', pomodoroGoal, time)
      this.service.cookieService.set('pomodoroTime', minutes.toString())
    }
  }

  toggleQuillColors() {
    const qlToolbar = Array.prototype.slice.call(document.getElementsByClassName('ql-toolbar'))
    const qlEditor = Array.prototype.slice.call(document.getElementsByClassName('ql-editor'))
    if (this.service.night) {
      qlToolbar.forEach(e => e.classList.add('night-toolbar'))
      qlEditor.forEach(e => e.classList.add('night-input'))
    } else {
      qlToolbar.forEach(e => e.classList.remove('night-toolbar'))
      qlEditor.forEach(e => e.classList.remove('night-input'))
    }
  }

  toggleInfo(i: number, hovered: boolean) {
    const element = document.getElementById(`meal_${i}`)
    if (hovered) {
      element.classList.remove('hide')
    } else {
      element.classList.add('hide')
    }
  }

  moveCarousel(i: number) {
    const carouselPages = 4
    const carousel = (this.carousel + i) % carouselPages
    this.carousel = carousel === -1 ? carouselPages - 1 : carousel
    this.service.cookieService.set('carousel', this.carousel.toString(), DashboardService.getExp())
  }

  downloadPDF() {
    let str = this.service.cookieService.get('notes_0')
    str = str.replace(/<p>/g, '')
    str = str.replace(/-----/g, '<hr>')
    str = str.replace(/<\/p>/g, '<div style="height: 1px"></div>')
    str = str.replace(/<ul>/g, '<ol>')
    str = str.replace(/<\/ul>/g, '</ol>')
    str = str.replace(/<strong>/g, '<b>')
    str = str.replace(/<\/strong>/g, '</b>')
    str = str.replace(/class="ql-size-large"/g, 'style="font-size: 6px"')
    str = str.replace(/class="ql-indent-1"/g, 'style="margin-left: 3em"')
    str = str.replace(/class="ql-indent-2"/g, 'style="margin-left: 6em"')
    str = str.replace(/class="ql-indent-3"/g, 'style="margin-left: 9em"')
    str = '<div style="width: 11vw; padding: 10px; font-size: 3.8px; line-height: 4.5px;">' + str + '</div>'

    const doc = new jsPDF()
    doc.html(str as unknown as HTMLElement, {
      callback(d) {
        d.save('notes.pdf')
      }
    })
  }

  addTodo() {
    const todo = document.getElementById('todobox')['value']
    if (todo && this.todos.length <= 11) {
      this.todos.push(todo)
      this.todosStatus.push(false)
      this.service.cookieService.set('todos', JSON.stringify(this.todos), DashboardService.getExp())
      document.getElementById('todobox')['value'] = ''
    }
  }

  removeTodo(i: number) {
    if (i > -1) {
      this.todos.splice(i, 1)
      this.todosStatus.splice(i, 1)
      this.service.cookieService.set('todos', JSON.stringify(this.todos), DashboardService.getExp())
      this.service.cookieService.set('todosStatus', JSON.stringify(this.todosStatus), DashboardService.getExp())
    }
  }

  todoChecked(i: number) {
    if (i > -1) {
      this.todosStatus[i] = !this.todosStatus[i]
      this.service.cookieService.set('todosStatus', JSON.stringify(this.todosStatus), DashboardService.getExp())
    }
  }

  addMeal(meal: Meal) {
    if (meal && this.meals.length <= 11) {
      this.meals.push(meal)
      this.service.cookieService.set('meals', JSON.stringify(this.meals), DashboardService.getExp())
    }
  }

  removeMeal(i: number) {
    if (i > -1) {
      this.meals.splice(i, 1)
      this.service.cookieService.set('meals', JSON.stringify(this.meals), DashboardService.getExp())
    }
  }

  getChecked() {
    this.checked = !this.checked
    this.service.cookieService.set('checked', this.checked.toString(), DashboardService.getExp())
  }

  getkCal() {
    if (this.meals.length) {
      return this.meals.map(m => m.kCal).reduce((a, b) => a + b, 0)
    } else {
      return 0
    }
  }

  getProtein() {
    if (this.meals.length) {
      return this.meals.map(m => m.Protein).reduce((a, b) => a + b, 0)
    } else {
      return 0
    }
  }
}
