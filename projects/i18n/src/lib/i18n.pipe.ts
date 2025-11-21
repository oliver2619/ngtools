import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';

@Pipe({
  name: 'i18n',
  standalone: true,
})
export class I18nPipe implements PipeTransform {

  constructor(private readonly i18nService: I18nService) { }

  transform(value: unknown, ...args: unknown[]): unknown {
    if (typeof value === 'string') {
      return this.i18nService.get(value, ...args);
    } else {
      return value;
    }
  }

}
