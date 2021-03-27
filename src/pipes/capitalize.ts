import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(str: string): string {
    return str[0].toUpperCase() + str.substring(1)
  }
}
