import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFieldOption',
})
export class SearchFieldOptionPipe implements PipeTransform {
  transform(value: any[], name: any): any {
    if (name !== undefined) {
      if (value.length !== 0 && name !== null) {
        let splitData = name.split(' ');
        return value.filter((item) => {
          var found = true;
          splitData.forEach((str) => {
            if (item.name.toLowerCase().indexOf(str.toLowerCase()) == -1) {
              found = false;
            }
          });
          return found;
        });
      }
    }
    return value;
  }
}
