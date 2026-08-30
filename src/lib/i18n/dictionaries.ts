// src/lib/i18n/dictionaries.ts
// Patient-facing UI translations. English is the source of truth; Urdu covers
// navigation, buttons, headings, settings, notifications, advice/feedback and
// other common system text. Therapist-authored advice/feedback and patient
// journal text are NEVER translated — they render exactly as written.

export type Language = "en" | "ur";

// flat key -> string keeps lookups simple and typing strict
export type Dictionary = Record<string, string>;
export type TFunction = (key: string) => string;

const en: Dictionary = {
  // navigation
  nav_home: "Home",
  nav_todos: "To-dos",
  nav_feedback: "Feedback",
  nav_therapists: "Therapists",
  nav_settings: "Settings",
  nav_profile: "Profile",
  nav_notifications: "Notifications",

  // modules
  module_breathing: "Breathing",
  module_sound: "Sound Therapy",
  module_memory_match: "Memory Matcher",
  module_garden: "Calmly Garden",
  module_journal: "Journal",
  module_quiz: "Weekly Quiz",

  // homepage
  home_welcome: "Welcome to Calmly",
  home_current_score: "Current score",
  home_next_growth: "Next growth",
  home_my_plant: "My plant",
  home_quiz_card_title: "Weekly quiz",
  home_quiz_card_desc: "Check in with how you've been feeling",
  home_exercises_card_title: "Exercises",
  home_exercises_card_desc: "A few minutes to reset",
  home_journal_card_title: "Journal",
  home_journal_card_desc: "Write about your day",
  home_quiz_in_days: "You can take the weekly quiz after {days} day(s)",
  home_quiz_available: "This week's quiz is available",
  home_weekly_progress: "Your weekly progress",
  home_journal_progress: "Journal",
  home_exercises_progress: "Exercises",
  home_checkin_progress: "Weekly check-in",
  home_advice_title: "Therapist advice",
  home_advice_empty: "No advice from your therapist yet.",
  home_advice_cta: "Take me to {module}",

  // to-dos page
  todos_title: "My to-dos",
  todos_current: "Current",
  todos_completed: "Completed",
  todos_empty_current: "No active to-do right now.",
  todos_empty_completed: "Nothing completed yet.",
  todos_journal_hint: "You can check these off while writing your journal.",

  // feedback page
  feedback_title: "Feedback",
  feedback_subtitle: "Weekly feedback written personally by your therapist.",
  feedback_empty: "Your therapist hasn't written feedback yet.",
  feedback_week: "Week {week}",
  feedback_section_1: "Overall Weekly Observation",
  feedback_section_2: "Progress and Strength",
  feedback_section_3: "Areas to Focus On",
  feedback_section_4: "Feedback and Guidance",

  // notifications page
  notifications_title: "Notifications",
  notifications_empty: "You're all caught up.",
  notifications_marked_read: "Marked as read",

  // notification content (system-generated, translated at display time;
  // therapist-authored advice text is never translated)
  notif_quiz_title: "Your weekly quiz is ready",
  notif_quiz_message: "This week's check-in quiz is available to take.",
  notif_journal_title: "Your journal is ready",
  notif_journal_message: "Take a moment to write today's journal entry.",
  notif_advice_title: "New advice from your therapist",
  notif_feedback_title: "New feedback from your therapist",
  notif_feedback_message: "Your therapist shared feedback with you.",

  // settings page
  settings_title: "Settings",
  settings_appearance: "Appearance",
  settings_appearance_desc: "Switch between light and dark mode.",
  settings_dark_mode: "Dark mode",
  settings_language: "Language",
  settings_language_desc: "Choose your preferred language.",
  settings_account: "Account",
  settings_account_desc: "Log out of Calmly on this device.",
  settings_logout: "Log out",
  settings_logging_out: "Logging out...",
  settings_saving: "Saving...",

  // profile page
  profile_title: "My profile",
  profile_edit: "Edit profile",
  profile_name: "Name",
  profile_age: "Age",
  profile_email: "Email",
  profile_gender: "Gender",
  profile_anxiety_type: "Anxiety type",
  profile_member_since: "Member since",
  profile_language: "Language",
  profile_save: "Save changes",
  profile_saved: "Saved",

  // common
  common_back: "Back",
  common_today: "today",
  common_yesterday: "yesterday",
};

const ur: Dictionary = {
  // navigation
  nav_home: "ہوم",
  nav_todos: "کام",
  nav_feedback: "تاثرات",
  nav_therapists: "معالجین",
  nav_settings: "ترتیبات",
  nav_profile: "پروفائل",
  nav_notifications: "اطلاعات",

  // modules
  module_breathing: "سانس کی مشق",
  module_sound: "آواز تھراپی",
  module_memory_match: "میموری میچر",
  module_garden: "کالملی گارڈن",
  module_journal: "جرنل",
  module_quiz: "ہفتہ وار کوئز",

  // homepage
  home_welcome: "کالملی میں خوش آمدید",
  home_current_score: "موجودہ اسکور",
  home_next_growth: "اگلی نشوونما",
  home_my_plant: "میرا پودا",
  home_quiz_card_title: "ہفتہ وار کوئز",
  home_quiz_card_desc: "اپنے احساسات کا جائزہ لیجیے",
  home_exercises_card_title: "مشقیں",
  home_exercises_card_desc: "چند منٹ سکون کے لیے",
  home_journal_card_title: "جرنل",
  home_journal_card_desc: "اپنے دن کے بارے میں لکھیں",
  home_quiz_in_days: "آپ ہفتہ وار کوئز {days} دن بعد دے سکتے ہیں",
  home_quiz_available: "اس ہفتے کا کوئز دستیاب ہے",
  home_weekly_progress: "آپ کی ہفتہ وار پیش رفت",
  home_journal_progress: "جرنل",
  home_exercises_progress: "مشقیں",
  home_checkin_progress: "ہفتہ وار چیک اِن",
  home_advice_title: "معالج کی مشورہ",
  home_advice_empty: "آپ کے معالج کی طرف سے ابھی کوئی مشورہ نہیں ہے۔",
  home_advice_cta: "{module} پر جائیں",

  // to-dos page
  todos_title: "میرے کام",
  todos_current: "موجودہ",
  todos_completed: "مکمل شدہ",
  todos_empty_current: "ابھی کوئی فعال کام نہیں ہے۔",
  todos_empty_completed: "ابھی کچھ مکمل نہیں ہوا۔",
  todos_journal_hint: "آپ یہ کام جرنل لکھتے وقت مکمل کر سکتے ہیں۔",

  // feedback page
  feedback_title: "تاثرات",
  feedback_subtitle: "آپ کے معالج کی طرف سے ذاتی طور پر لکھی گئی ہفتہ وار رائے۔",
  feedback_empty: "آپ کے معالج نے ابھی کوئی تاثرات نہیں لکھے۔",
  feedback_week: "ہفتہ {week}",
  feedback_section_1: "ہفتہ وار مجموعی مشاہدہ",
  feedback_section_2: "پیش رفت اور طاقت",
  feedback_section_3: "توجہ دینے کے پہلو",
  feedback_section_4: "رہنمائی اور مشورہ",

  // notifications page
  notifications_title: "اطلاعات",
  notifications_empty: "آپ سب کچھ دیکھ چکے ہیں۔",
  notifications_marked_read: "پڑھ لیا گیا",

  // notification content
  notif_quiz_title: "آپ کا ہفتہ وار کوئز تیار ہے",
  notif_quiz_message: "اس ہفتے کا چیک اِن کوئز لینے کے لیے دستیاب ہے۔",
  notif_journal_title: "آپ کا جرنل تیار ہے",
  notif_journal_message: "آج کے جرنل کے لیے چند لمحے نکالیں۔",
  notif_advice_title: "معالج کی جانب سے نئی مشورہ",
  notif_feedback_title: "معالج کی جانب سے نئی رائے",
  notif_feedback_message: "آپ کے معالج نے آپ کے ساتھ رائے شیئر کی ہے۔",

  // settings page
  settings_title: "ترتیبات",
  settings_appearance: "ظاہری شکل",
  settings_appearance_desc: "روشنی اور تاریک موڈ کے درمیان تبدیل کریں۔",
  settings_dark_mode: "ڈارک موڈ",
  settings_language: "زبان",
  settings_language_desc: "اپنی پسندیدہ زبان منتخب کریں۔",
  settings_account: "اکاؤنٹ",
  settings_account_desc: "اس ڈیوائس سے کالملی لاگ آؤٹ کریں۔",
  settings_logout: "لاگ آؤٹ",
  settings_logging_out: "لاگ آؤٹ ہو رہا ہے...",
  settings_saving: "محفوظ ہو رہا ہے...",

  // profile page
  profile_title: "میری پروفائل",
  profile_edit: "پروفائل میں تبدیلی",
  profile_name: "نام",
  profile_age: "عمر",
  profile_email: "ای میل",
  profile_gender: "جنس",
  profile_anxiety_type: "بےچینی کی قسم",
  profile_member_since: "رکنیت از",
  profile_language: "زبان",
  profile_save: "تبدیلیاں محفوظ کریں",
  profile_saved: "محفوظ ہو گیا",

  // common
  common_back: "واپس",
  common_today: "آج",
  common_yesterday: "کل",
};

const DICTIONARIES: Record<Language, Dictionary> = { en, ur };

export function getDictionary(language: Language): Dictionary {
  return DICTIONARIES[language] ?? DICTIONARIES.en;
}

export function tFor(language: Language): TFunction {
  const dict = getDictionary(language);
  return (key: string) => dict[key] ?? key;
}

// {placeholder} interpolation
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    values[k] !== undefined ? String(values[k]) : `{${k}}`
  );
}
