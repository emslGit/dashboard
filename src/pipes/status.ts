import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'status'
})
export class HabitStatusPipe implements PipeTransform {

  transform(status: number): string {
    if (status == 0) {
      return ''
    } else if (status == 1) {
      return '+'
    } else if (status == 2) {
      return '-'
    } else if (status == 3) {
      return '0'
    }
  }
}
