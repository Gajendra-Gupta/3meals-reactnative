import {I18nManager} from "react-native";
import * as RNLocalize from "react-native-localize";
import i18n from 'i18n-js';
import en from './translations/en';
import de from './translations/de';

//const { languageTag, isRTL } = { languageTag: "de", isRTL: false };
const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(["en","de"]);

I18nManager.forceRTL(isRTL);

i18n.defaultLocale = languageTag == "de" ? de : en;
i18n.translations = languageTag == "de" ? { de } : { en };
i18n.locale = languageTag;

export const rtl = isRTL;

export default i18n;