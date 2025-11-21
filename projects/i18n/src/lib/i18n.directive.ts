import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { I18nService } from './i18n.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[ptI18n]',
  standalone: true,
})
export class I18nDirective {

  readonly ptI18n = input.required<string>();
  readonly ptI18nParams = input<any[]>([]);

  private readonly i18nService = inject(I18nService);
  private readonly element = inject(ElementRef<HTMLElement>);

  constructor() {
    effect(() => this.updateText());
    this.i18nService.languageChange.pipe(
      takeUntilDestroyed()
    ).subscribe({ next: () => this.updateText() });
  }

  private updateText() {
    this.element.nativeElement.innerText = this.i18nService.get(this.ptI18n(), ...this.ptI18nParams());
  }
}
