import { provideAppInitializer } from "@angular/core";
import { I18nDictionary } from "./i18n-dictionary";
import { registerDictionaries } from "./i18n.service";

const testDictionaryEnGb: I18nDictionary = {
    color: 'colour',
    withParam: 'Hello {{0}}'
}

const testDictionaryEnUs: I18nDictionary = {
    color: 'color',
    withParam: 'Hello {{0}}'
}

const testDictionaryDe: I18nDictionary = {
    color: 'Farbe',
    withParam: 'Hallo {{0}}'
}

export const testDictionariesInitializer = provideAppInitializer(() => registerDictionaries({
    'en-GB': () => testDictionaryEnGb,
    'en-US': () => testDictionaryEnUs,
    'de': () => testDictionaryDe
}));