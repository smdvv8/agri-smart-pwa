import ru from "@/messages/ru.json";
import tj from "@/messages/tj.json";

export type AppLanguage = "RU" | "TJ";
export type Messages = typeof ru;
export type TranslationKey = keyof Messages;

export function getDictionary(language: AppLanguage = "RU") {
  return language === "TJ" ? tj : ru;
}

export function translate(language: AppLanguage, key: TranslationKey) {
  const dictionary = getDictionary(language);
  return dictionary[key] || ru[key] || key;
}
