import {NgModule} from '@angular/core'
import {Routes, RouterModule} from '@angular/router'
import {GoalComponent} from './goal/goal.component'
import {DashboardComponent} from './dashboard/dashboard.component'
import {YesterdayComponent} from './yesterday/yesterday.component'
import {DictionaryComponent} from './dictionary/dictionary.component'
import {HabitsComponent} from './habits/habits.component'

const routes: Routes = [
  { path: 'yesterday', component: YesterdayComponent },
  { path: 'goal', component: GoalComponent },
  { path: 'dictionary', component: DictionaryComponent },
  { path: 'habits', component: HabitsComponent },
  { path: '', component: DashboardComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
