import { EnvironmentProviders, Injectable, provideAppInitializer } from '@angular/core';
import { I18nDictionary } from './i18n-dictionary';
import { Observable, Subject } from 'rxjs';

const dictionariesByLanguage = new Map<string, () => (I18nDictionary | Promise<I18nDictionary>)>();
// short lang to full lang if not registered as dictionary
const languageAliases = new Map<string, string>();

let currentDictionary: I18nDictionary | undefined;
let currentLanguage = '';
let languageChange = new Subject<string>();
let defaultLanguage: string | undefined;

function setCurrentLanguage(fullLang: string): Promise<void> {
  if (currentLanguage !== fullLang) {
    let resolvedLanguage = fullLang;
    let resolver = dictionariesByLanguage.get(fullLang);
    if (resolver == undefined) {
      const i = fullLang.indexOf('-');
      if (i >= 0) {
        const lang = fullLang.substring(0, i);
        resolvedLanguage = lang;
        resolver = dictionariesByLanguage.get(lang);
        if (resolver == undefined) {
          const alias = languageAliases.get(lang);
          if (alias != undefined) {
            resolvedLanguage = alias;
            resolver = dictionariesByLanguage.get(alias);
          }
        }
      } else {
        const alias = languageAliases.get(fullLang);
          if (alias != undefined) {
            resolvedLanguage = alias;
            resolver = dictionariesByLanguage.get(alias);
          }
      }
    }
    if (resolver == undefined) {
      throw new RangeError(`No dictionary found for language '${fullLang}'.`);
    }
    const dict = resolver();
    if (dict instanceof Promise) {
      return dict.then(it => {
        currentDictionary = it;
        currentLanguage = resolvedLanguage;
        document.documentElement.lang = resolvedLanguage;
        languageChange.next(resolvedLanguage);
      });
    } else {
      currentDictionary = dict;
      currentLanguage = resolvedLanguage;
      document.documentElement.lang = resolvedLanguage;
      languageChange.next(resolvedLanguage);
      return Promise.resolve();
    }
  } else {
    return Promise.resolve();
  }
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {

  get hasDictionary(): boolean {
    return currentDictionary != undefined;
  }

  get language(): string {
    return currentLanguage;
  }

  get languageChange(): Observable<string> {
    return languageChange;
  }

  get availableLanguages(): readonly string[] {
    return Array.from(dictionariesByLanguage.keys());
  }

  get(id: string, ...params: any[]): string {
    if (currentDictionary == undefined) {
      throw new Error('No dictionary set.');
    }
    const found = currentDictionary[id];
    if (found == undefined) {
      console.warn(`No entry found in dictionary for language '${languageChange} and text id '${id}'.`);
      return id;
    }
    return this.resolveParameters(found, params);
  }

  setLanguage(l: string) {
    setCurrentLanguage(l);
  }

  private resolveParameters(text: string, params: any[]): string {
    let i = 0;
    let ret = text;
    while (i < ret.length) {
      const f1 = ret.indexOf('{{', i);
      if (f1 < 0) {
        return ret;
      }
      const f2 = ret.indexOf('}}', f1 + 2);
      const paramIndex = Number.parseInt(ret.substring(f1 + 2, f2 >= 0 ? f2 : undefined));
      if (paramIndex < 0 || paramIndex >= params.length) {
        throw new RangeError(`Parameter index ${paramIndex} out of range of supplied parameters.`);
      }
      const param = params[paramIndex];
      ret = ret.substring(0, f1) + param + (f2 >= 0 ? ret.substring(f2 + 2) : '');
      i = f1 + param.length;
    }
    return ret;
  }
}

function initDictionary(): Promise<void> {
  if (currentLanguage !== '') {
    return Promise.resolve();
  }
  const foundExact = navigator.languages.filter(it => dictionariesByLanguage.has(it) || languageAliases.has(it));
  if (foundExact.length > 0) {
    return setCurrentLanguage(foundExact[0]);
  }
  const found = navigator.languages.map(it => it.split('-')[0]).filter(it => dictionariesByLanguage.has(it) || languageAliases.has(it));
  if (found.length > 0) {
    return setCurrentLanguage(found[0]);
  }
  if (defaultLanguage != undefined) {
    return setCurrentLanguage(defaultLanguage);
  }
  return Promise.resolve();
}

function registerDictionary(language: string, dict: () => (I18nDictionary | Promise<I18nDictionary>)) {
  dictionariesByLanguage.set(language, dict);
  if (defaultLanguage == undefined) {
    defaultLanguage = language;
  }
  const i = language.indexOf('-');
  if (i >= 0) {
    const shortLang = language.substring(0, i);
    if (!languageAliases.has(shortLang)) {
      languageAliases.set(shortLang, language);
    }
  }
}

export function provideDictionaries(dictionaryByLanguage: { [key: string]: () => (I18nDictionary | Promise<I18nDictionary>) }): EnvironmentProviders {
  return provideAppInitializer(() => registerDictionaries(dictionaryByLanguage));
}

export function registerDictionaries(dictionaryByLanguage: { [key: string]: () => (I18nDictionary | Promise<I18nDictionary>) }): Promise<void> {
  Object.entries(dictionaryByLanguage).forEach(it => {
    registerDictionary(it[0], it[1]);
  });
  return initDictionary();
}