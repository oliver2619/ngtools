import { TestBed } from '@angular/core/testing';
import { I18nDirective } from './i18n.directive';
import { I18nService } from './i18n.service';
import { Component } from '@angular/core';
import { testDictionariesInitializer } from './test-dictionary';

@Component({
  template: `
  <span ptI18n="color"></span>
  <div ptI18n="withParam" [ptI18nParams]="['World']"></div>
  `,
  imports: [I18nDirective]
})
class DirectiveTestComponent {
}

describe('I18nDirective', () => {

  let service: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DirectiveTestComponent],
      providers: [
        testDictionariesInitializer
      ]
    }).compileComponents();
    service = TestBed.inject(I18nService);
    service.setLanguage('en-GB');
  });

  it('should resolve text', () => {
    const fixture = TestBed.createComponent(DirectiveTestComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('span')?.innerText).toBe('colour');
  });

  it('should resolve params', () => {
    const fixture = TestBed.createComponent(DirectiveTestComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('div')?.innerText).toBe('Hello World');
  });

  it('should detect language changes', () => {
    const fixture = TestBed.createComponent(DirectiveTestComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('span')?.innerText).toBe('colour');
    service.setLanguage('de');
    expect((fixture.nativeElement as HTMLElement).querySelector('span')?.innerText).toBe('Farbe');
  });
});
