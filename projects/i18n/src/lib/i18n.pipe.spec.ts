import { TestBed } from '@angular/core/testing';
import { I18nPipe } from './i18n.pipe';
import { I18nService } from './i18n.service';
import { testDictionariesInitializer } from './test-dictionary';

describe('I18nPipe', () => {

  let service: I18nService;
  let pipe: I18nPipe;

  beforeEach( () => {
    TestBed.configureTestingModule({
      providers: [
        testDictionariesInitializer
      ]
    });
    service = TestBed.inject(I18nService);
    service.setLanguage('en-GB');
    pipe = new I18nPipe(service);
  });

  it('should create instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should resolve text', () => {
    expect(pipe.transform('color')).toBe('colour');
  });

  it('should resolve params', () => {
    expect(pipe.transform('withParam', 'World')).toBe('Hello World');
  });

});
