import { TestBed, waitForAsync } from '@angular/core/testing';

import { I18nService } from './i18n.service';
import { testDictionariesInitializer } from './test-dictionary';

describe('I18nService', () => {

  let service: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        testDictionariesInitializer
      ]
    });
    service = TestBed.inject(I18nService);
    service.setLanguage('en');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should enumerate languages', () => {
    expect(service.availableLanguages.length).toBe(3);
    expect(service.availableLanguages).toContain('en-GB');
    expect(service.availableLanguages).toContain('en-US');
    expect(service.availableLanguages).toContain('de');
  });

  it('should resolve text', waitForAsync(() => {
    expect(service.get('color')).toBe('colour');
  }));

  it('should resolve params', waitForAsync(() => {
    expect(service.get('withParam', 'World')).toBe('Hello World');
  }));

  it('should notify about changes', waitForAsync(() => {
    const changes: string[] = [];
    const subscription = service.languageChange.subscribe({next: value => changes.push(value)});
    service.setLanguage('de');
    subscription.unsubscribe();
    expect(changes.length).toBe(1);
    expect(changes[0]).toBe('de');
  }));

  it('should accept unprecise language id', () => {
    service.setLanguage('en');
    expect(service.language).toBe('en-GB');
    expect(service.get('color')).toBe('colour');

    service.setLanguage('en-US');
    expect(service.language).toBe('en-US');
    expect(service.get('color')).toBe('color');
    
    service.setLanguage('de');
    expect(service.language).toBe('de');
    expect(service.get('color')).toBe('Farbe');

    service.setLanguage('en-GB');
    expect(service.language).toBe('en-GB');
    expect(service.get('color')).toBe('colour');

    service.setLanguage('de-DE');
    expect(service.language).toBe('de');
    expect(service.get('color')).toBe('Farbe');

    service.setLanguage('en-AU');
    expect(service.language).toBe('en-GB');
    expect(service.get('color')).toBe('colour');
  });
});
