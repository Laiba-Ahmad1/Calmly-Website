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
  nav_journal: "Journal",
  nav_journals: "My Journals",
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

  // ---------- therapist workspace ----------
  // navigation
  t_nav_dashboard: "Dashboard",
  t_nav_patients: "Patients",
  t_nav_requests: "Requests",
  t_nav_reports: "Reports",
  t_nav_profile: "Profile",
  t_workspace: "Therapist workspace",
  t_logout: "Log out",
  t_logging_out: "Logging out…",

  // greetings + relative time
  t_greet_morning: "Good morning",
  t_greet_afternoon: "Good afternoon",
  t_greet_evening: "Good evening",
  t_week: "Week {week}",
  t_rel_today: "today",
  t_rel_yesterday: "yesterday",
  t_rel_days_ago: "{days} days ago",
  t_rel_month_ago: "1 month ago",
  t_rel_months_ago: "{months} months ago",

  // verification screen (pre-approval)
  t_verify_pending_title: "Verification in progress",
  t_verify_pending_body:
    "Welcome, {name}. Your document is being reviewed by our team. You will get access to your therapist workspace as soon as your account is verified.",
  t_verify_rejected_title: "Verification was not approved",
  t_verify_rejected_reason: "Reason: {reason}",
  t_verify_rejected_default: "Your submitted document could not be verified.",

  // dashboard
  t_dash_active_patients: "Active patients",
  t_dash_pending_requests: "Pending requests",
  t_dash_recent_reports: "Recent reports",
  t_dash_review_requests: "Review requests",
  t_dash_review_title: "Patients to review",
  t_dash_review_desc:
    "Flagged from the most recent weekly reports — updated weekly, not live monitoring.",
  t_dash_no_patients:
    "No connected patients yet — accept a patient request to get started.",
  t_dash_nothing_flagged: "Nothing flagged in the latest weekly reports.",
  t_dash_reports_title: "Recent weekly reports",
  t_dash_all_reports: "All reports",
  t_dash_no_reports:
    "No reports yet — the first weekly report appears after a patient completes a full week in Calmly.",
  t_dash_disclaimer:
    "Reports summarize logged information from the past week. They are observations for support — not live monitoring and not a diagnosis.",
  t_dash_report_of: "Report of {date}",
  t_reason_mood: "mood average dipped vs the previous week",
  t_reason_sleep: "sleep quality dipped vs the previous week",
  t_reason_quiz: "quiz score suggests more struggle than last week",
  t_reason_journal: "journaled only {days}/7 days",
  t_reason_quiz_missing: "weekly quiz not completed",

  // patients list
  t_patients_title: "Patients",
  t_patients_empty: "You are not working with any patients yet.",
  t_patients_count_one: "{count} connected patient.",
  t_patients_count_many: "{count} connected patients.",
  t_patients_accept_hint: "Accept a patient request to start working together.",
  t_patients_go_requests: "Go to requests",
  t_patients_anxiety: "{type} anxiety",
  t_patients_anxiety_not_set: "Anxiety type not set",
  t_patients_connected_since: "connected since {date}",
  t_patients_last_journal: "Last journal {when}",
  t_patients_no_journals: "No journals yet",
  t_patients_last_report: "last report {date}",
  t_patients_no_report: "no report yet",
  t_patients_mood_sleep: "Mood {mood}/5 · Sleep {sleep}/5",

  // requests
  t_req_title: "Requests",
  t_req_empty: "Patients who want to work with you will send requests here.",
  t_req_pending_one:
    "{count} pending request. Accepting connects the patient to you in Calmly.",
  t_req_pending_many:
    "{count} pending requests. Accepting connects the patient to you in Calmly.",
  t_req_accept: "Accept",
  t_req_reject: "Reject",
  t_req_requested: "requested {when}",

  // reports list
  t_reports_title: "Reports",
  t_reports_subtitle:
    "Weekly AI reports for your connected patients — one per patient per completed week.",
  t_reports_empty:
    "No reports yet. A patient's first weekly report is generated automatically once they complete a full week in Calmly.",
  t_reports_disclaimer:
    "Reports interpret logged information with careful, observational language. They are not a diagnosis.",
  t_reports_view: "View report",
  t_reports_generated: "generated {date}",

  // report detail
  t_report_title: "Weekly report — {name}",
  t_report_week_line: "Week {week} · {range} · generated {date}",
  t_report_overview: "Weekly Overview",
  t_report_patterns: "Observed Patterns",
  t_report_progress: "Progress",
  t_report_areas: "Suggested Areas for Therapist Attention",
  t_report_numbers: "This week's numbers",
  t_report_stat_journals: "Journals",
  t_report_stat_mood: "Avg mood",
  t_report_stat_sleep: "Avg sleep",
  t_report_stat_quiz: "Weekly quiz",
  t_report_stat_exercises: "Exercises",
  t_report_stat_task: "Assigned to-do",
  t_report_days: "{days}/7 days",
  t_report_completed: "Completed",
  t_report_not_completed: "Not completed",
  t_report_none: "None",
  t_report_task_completed: "completed during the week",
  t_report_task_not_completed: "not completed during the week",
  t_report_none_assigned: "None assigned",
  t_report_disclaimer:
    "This is a summary of logged information — not a diagnosis.",

  // daily mood & sleep chart
  t_report_ms_title: "Daily Mood & Sleep Pattern",
  t_report_ms_subtitle:
    "A daily view of the patient's recorded mood and sleep quality throughout the week.",
  t_report_ms_mood: "Mood",
  t_report_ms_sleep: "Sleep Quality",
  t_report_ms_scale: "/5",
  t_report_ms_nodata: "No data",
  t_report_ms_empty:
    "No journal entries were logged this week, so no daily pattern can be shown.",
  t_report_ms_caption:
    "Based on the patient's self-reported mood and sleep quality — not a clinical measurement.",

  // notifications
  t_notif_title: "Notifications",
  t_notif_empty: "You're all caught up.",

  // therapist profile
  t_profile_edit: "Edit profile",
  t_profile_about: "About",
  t_profile_account: "Account details",
  t_profile_verified: "Verified therapist",
  t_profile_no_bio: "No professional bio has been added to this profile yet.",
  t_profile_verification: "Verification",
  t_profile_approved: "Approved",
  t_profile_approved_on: "Approved on {date}",
  t_profile_document: "Document",
  t_profile_submitted: "Submitted",
  t_profile_member_since: "Member since",

  // profile edit form
  t_pf_about_you: "About you",
  t_pf_bio_placeholder: "A short professional bio your patients will see.",
  t_pf_change_picture: "Change picture",
  t_pf_upload_picture: "Upload picture",
  t_pf_remove_selected: "Remove selected file",
  t_pf_save: "Save changes",
  t_pf_saving: "Saving...",
  t_pf_saved: "Saved",
  t_pf_error_save: "Could not save changes",
  t_pf_error_generic: "Something went wrong. Try again.",

  // language preference
  t_lang_title: "Language",
  t_lang_desc: "Choose your preferred language for the therapist workspace.",
  t_lang_saving: "Saving...",

  // patient detail page
  t_pd_years: "{age} years",
  t_pd_connected_since: "connected since {date}",
  t_pd_this_week: "This week",
  t_pd_week_line: "Week {week} · {range} · in progress",
  t_pd_stat_mood: "Mood",
  t_pd_stat_sleep: "Sleep quality",
  t_pd_stat_journals: "Journals",
  t_pd_stat_quiz: "Weekly quiz",
  t_pd_stat_exercises: "Exercises",
  t_pd_stat_growth: "Growth",
  t_pd_days: "{days}/7 days",
  t_pd_quiz_not_completed: "Not completed",
  t_pd_last_quiz_score: "last completed week score {score}/{max}",
  t_pd_completed_this_week: "completed this week",
  t_pd_exercises_none: "None yet",
  t_pd_stage: "Stage {n}",
  t_pd_fully_grown: "Fully grown",
  t_pd_more_to_next: "{count} more to next stage · {total} points total",
  t_pd_points_total: "{total} points total",
  t_pd_tasks_title: "Assigned to-dos",
  t_pd_tasks_hint: "The patient sees these in their journal and checks them off there.",
  t_pd_tasks_none: "No active to-do right now.",
  t_pd_recently_completed: "Recently completed",
  t_pd_assigned: "assigned {date}",
  t_pd_completed_via_journal: "completed {date} · via journal",
  t_pd_advice_title: "Advice",
  t_pd_advice_hint:
    "Shown on the patient's homepage with a link to the related Calmly module.",
  t_pd_advice_none: "No active advice right now.",
  t_pd_related_to: "related to {module}",
  t_pd_shared: "shared {date}",
  t_pd_remove: "Remove",
  t_pd_removing: "Removing...",
  t_pd_feedback_title: "Weekly feedback",
  t_pd_previous_feedback: "Previous feedback",
  t_pd_feedback_week_line: "Week {week} · {range} · updated {date}",
  t_pd_quiz_title: "Upcoming weekly quiz",
  t_pd_latest_report: "Latest weekly report",
  t_pd_view_full_report: "View full report",
  t_pd_report_week: "Week {week} · {range}",
  t_pd_no_report:
    "No weekly report yet — the first one is generated after a full week of Calmly activity.",
  t_pd_focus_title: "Quiz focus areas",
  t_pd_focus_desc: "Highest-scoring dimensions from the most recent weekly quiz.",
  t_pd_journals_title: "Recent journals",
  t_pd_no_journals_week: "No journals this week — the last entry was {when}.",
  t_pd_no_journals: "The patient hasn't written any journals yet.",
  t_pd_journal_meta: "{date} · Mood {mood}/5 · Sleep {sleep}/5",
  t_pd_feelings: "Feelings",
  t_pd_reflection: "Reflection",
  t_pd_todo: "To-do:",
  t_pd_disclaimer:
    "This page summarizes the patient's logged week. It is not live monitoring and not a diagnosis.",
  t_pd_view_patient: "View patient",

  // trends
  t_trend_up: "↑ vs previous week",
  t_trend_down: "↓ vs previous week",
  t_trend_flat: "≈ similar to previous week",

  // task form
  t_task_placeholder: 'e.g. "Practice slow breathing for 5 minutes before bed"',
  t_task_assign: "Assign to-do",
  t_task_assigning: "Assigning…",
  t_task_assigned: "To-do assigned — it will appear in the patient's journal.",
  t_task_error: "Failed to assign the to-do",

  // advice form
  t_advice_new: "New advice",
  t_advice_related: "Related to",
  t_advice_share: "Share advice",
  t_advice_sharing: "Sharing...",
  t_advice_placeholder:
    "e.g. Try the breathing exercise when you notice yourself feeling overwhelmed.",
  t_advice_hint:
    "Advice should relate to Calmly features — exercises, journal, or the weekly quiz. Please avoid medical or diagnostic instructions.",
  t_advice_error: "Could not save advice",
  t_advice_error_generic: "Something went wrong. Try again.",

  // feedback form (section titles reuse feedback_section_1..4)
  t_fb_hint: "Written in your own words — the patient sees this under Feedback.",
  t_fb_saved: "Saved",
  t_fb_save_for: "Save feedback for week {week}",
  t_fb_saving: "Saving...",
  t_fb_error: "Could not save feedback",
  t_fb_error_generic: "Something went wrong. Try again.",
  t_fb_placeholder_1: "How was the patient's week overall, based on their logged activity?",
  t_fb_placeholder_2: "What went well? What strengths did the patient show this week?",
  t_fb_placeholder_3: "Which areas deserve gentle attention in the coming week?",
  t_fb_placeholder_4: "Personal guidance in your own words.",

  // quiz review
  t_qr_intro_ai: "AI-planned questions for week {week}.",
  t_qr_intro_edited:
    "AI-planned questions for week {week} — you have edited this week's quiz.",
  t_qr_hint:
    "Edit any question to replace it with your version; leave them as they are and the patient automatically receives the AI-planned quiz.",
  t_qr_question: "Question {n}",
  t_qr_options: "Options:",
  t_qr_save: "Save my version",
  t_qr_saving: "Saving...",
  t_qr_saved: "Saved — the patient will receive your version for week {week}.",
  t_qr_unsaved: "You have unsaved edits to this week's questions.",
  t_qr_error: "Could not save the questions",
  t_qr_error_generic: "Something went wrong. Try again.",
};

const ur: Dictionary = {
  // navigation
  nav_home: "ہوم",
  nav_journal: "جرنل",
  nav_journals: "میرے جرنلز",
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

  // ---------- therapist workspace ----------
  // navigation
  t_nav_dashboard: "ڈیش بورڈ",
  t_nav_patients: "مریض",
  t_nav_requests: "درخواستیں",
  t_nav_reports: "رپورٹس",
  t_nav_profile: "پروفائل",
  t_workspace: "معالج ورک اسپیس",
  t_logout: "لاگ آؤٹ",
  t_logging_out: "لاگ آؤٹ ہو رہا ہے…",

  // greetings + relative time
  t_greet_morning: "صبح بخیر",
  t_greet_afternoon: "دوپہر بخیر",
  t_greet_evening: "شام بخیر",
  t_week: "ہفتہ {week}",
  t_rel_today: "آج",
  t_rel_yesterday: "کل",
  t_rel_days_ago: "{days} دن پہلے",
  t_rel_month_ago: "1 ماہ پہلے",
  t_rel_months_ago: "{months} ماہ پہلے",

  // verification screen (pre-approval)
  t_verify_pending_title: "تصدیق جاری ہے",
  t_verify_pending_body:
    "خوش آمدید، {name}۔ آپ کی دستاویز کا جائزہ ہماری ٹیم لے رہی ہے۔ جیسے ہی آپ کا اکاؤنٹ تصدیق ہو جائے، آپ کو اپنا معالج ورک اسپیس مل جائے گا۔",
  t_verify_rejected_title: "تصدیق منظور نہیں ہوئی",
  t_verify_rejected_reason: "وجہ: {reason}",
  t_verify_rejected_default: "آپ کی جمع کرائی گئی دستاویز کی تصدیق نہیں ہو سکی۔",

  // dashboard
  t_dash_active_patients: "فعال مریض",
  t_dash_pending_requests: "زیرِ التوا درخواستیں",
  t_dash_recent_reports: "حالیہ رپورٹس",
  t_dash_review_requests: "درخواستیں دیکھیں",
  t_dash_review_title: "جانچ کرنے والے مریض",
  t_dash_review_desc:
    "سب سے حالیہ ہفتہ وار رپورٹس سے نشان زد — ہفتہ وار اپ ڈیٹ ہوتا ہے، لائیو نگرانی نہیں۔",
  t_dash_no_patients:
    "ابھی کوئی مریض منسلک نہیں — شروع کرنے کے لیے مریض کی درخواست قبول کریں۔",
  t_dash_nothing_flagged: "تازہ ترین ہفتہ وار رپورٹس میں کچھ بھی نشان زد نہیں ہوا۔",
  t_dash_reports_title: "حالیہ ہفتہ وار رپورٹس",
  t_dash_all_reports: "تمام رپورٹس",
  t_dash_no_reports:
    "ابھی کوئی رپورٹ نہیں — پہلی ہفتہ وار رپورٹ تب بنتی ہے جب کوئی مریض کالملی میں ایک مکمل ہفتہ مکمل کر لے۔",
  t_dash_disclaimer:
    "رپورٹس گزشتہ ہفتے کی درج شدہ معلومات کا خلاصہ ہیں۔ یہ معاونت کے لیے مشاہدات ہیں — نہ لائیو نگرانی اور نہ تشخیص۔",
  t_dash_report_of: "{date} کی رپورٹ",
  t_reason_mood: "پچھلے ہفتے کے مقابلے میں موڈ کی اوسط میں کمی",
  t_reason_sleep: "پچھلے ہفتے کے مقابلے میں نیند کے معیار میں کمی",
  t_reason_quiz: "کوئز اسکور پچھلے ہفتے سے زیادہ مشکلات کی طرف اشارہ کرتا ہے",
  t_reason_journal: "صرف {days}/7 دن جرنل لکھا",
  t_reason_quiz_missing: "ہفتہ وار کوئز مکمل نہیں ہوا",

  // patients list
  t_patients_title: "مریض",
  t_patients_empty: "آپ ابھی کسی مریض کے ساتھ کام نہیں کر رہے۔",
  t_patients_count_one: "{count} منسلک مریض۔",
  t_patients_count_many: "{count} منسلک مریض۔",
  t_patients_accept_hint: "مل کر کام شروع کرنے کے لیے مریض کی درخواست قبول کریں۔",
  t_patients_go_requests: "درخواستوں پر جائیں",
  t_patients_anxiety: "{type} بےچینی",
  t_patients_anxiety_not_set: "بےچینی کی قسم مقرر نہیں",
  t_patients_connected_since: "{date} سے منسلک",
  t_patients_last_journal: "آخری جرنل {when}",
  t_patients_no_journals: "ابھی کوئی جرنل نہیں",
  t_patients_last_report: "آخری رپورٹ {date}",
  t_patients_no_report: "ابھی کوئی رپورٹ نہیں",
  t_patients_mood_sleep: "موڈ {mood}/5 · نیند {sleep}/5",

  // requests
  t_req_title: "درخواستیں",
  t_req_empty: "جو مریض آپ کے ساتھ کام کرنا چاہتے ہیں وہ یہاں درخواستیں بھیجیں گے۔",
  t_req_pending_one:
    "{count} زیرِ التوا درخواست۔ قبول کرنے پر مریض کالملی میں آپ سے منسلک ہو جاتا ہے۔",
  t_req_pending_many:
    "{count} زیرِ التوا درخواستیں۔ قبول کرنے پر مریض کالملی میں آپ سے منسلک ہو جاتا ہے۔",
  t_req_accept: "قبول کریں",
  t_req_reject: "مسترد کریں",
  t_req_requested: "{when} درخواست بھیجی",

  // reports list
  t_reports_title: "رپورٹس",
  t_reports_subtitle:
    "آپ کے منسلک مریضوں کی ہفتہ وار AI رپورٹس — ہر مکمل ہفتے پر ہر مریض کے لیے ایک۔",
  t_reports_empty:
    "ابھی کوئی رپورٹ نہیں۔ مریض کی پہلی ہفتہ وار رپورٹ خودکار طور پر تب بنتی ہے جب وہ کالملی میں ایک مکمل ہفتہ مکمل کر لیتا ہے۔",
  t_reports_disclaimer:
    "رپورٹس درج شدہ معلومات کو محتاط، مشاہداتی انداز میں بیان کرتی ہیں۔ یہ کوئی تشخیص نہیں۔",
  t_reports_view: "رپورٹ دیکھیں",
  t_reports_generated: "تشکیل {date}",

  // report detail
  t_report_title: "ہفتہ وار رپورٹ — {name}",
  t_report_week_line: "ہفتہ {week} · {range} · تشکیل {date}",
  t_report_overview: "ہفتہ وار جائزہ",
  t_report_patterns: "مشاہدات",
  t_report_progress: "پیش رفت",
  t_report_areas: "معالج کی توجہ کے تجویز کردہ پہلو",
  t_report_numbers: "اس ہفتے کے اعداد",
  t_report_stat_journals: "جرنلز",
  t_report_stat_mood: "اوسط موڈ",
  t_report_stat_sleep: "اوسط نیند",
  t_report_stat_quiz: "ہفتہ وار کوئز",
  t_report_stat_exercises: "مشقیں",
  t_report_stat_task: "تفویض کردہ کام",
  t_report_days: "{days}/7 دن",
  t_report_completed: "مکمل ہوا",
  t_report_not_completed: "مکمل نہیں ہوا",
  t_report_none: "کوئی نہیں",
  t_report_task_completed: "ہفتے کے دوران مکمل ہوا",
  t_report_task_not_completed: "ہفتے کے دوران مکمل نہیں ہوا",
  t_report_none_assigned: "کوئی کام تفویض نہیں",
  t_report_disclaimer: "یہ درج شدہ معلومات کا خلاصہ ہے — کوئی تشخیص نہیں۔",

  // daily mood & sleep chart
  t_report_ms_title: "روزانہ موڈ اور نیند کا نمونہ",
  t_report_ms_subtitle:
    "ہفتے بھر مریض کے درج شدہ موڈ اور نیند کے معیار کا روزانہ جائزہ۔",
  t_report_ms_mood: "موڈ",
  t_report_ms_sleep: "نیند کا معیار",
  t_report_ms_scale: "/5",
  t_report_ms_nodata: "کوئی ڈیٹا نہیں",
  t_report_ms_empty:
    "اس ہفتے کوئی جرنل اندراج درج نہیں ہوا، اس لیے روزانہ کا نمونہ نہیں دکھایا جا سکتا۔",
  t_report_ms_caption:
    "مریض کے خود درج کردہ موڈ اور نیند کے معیار پر مبنی — یہ کوئی طبی پیمائش نہیں ہے۔",

  // notifications
  t_notif_title: "اطلاعات",
  t_notif_empty: "آپ سب کچھ دیکھ چکے ہیں۔",

  // therapist profile
  t_profile_edit: "پروفائل میں تبدیلی",
  t_profile_about: "تعارف",
  t_profile_account: "اکاؤنٹ کی تفصیلات",
  t_profile_verified: "تصدیق شدہ معالج",
  t_profile_no_bio: "اس پروفائل میں ابھی کوئی پیشہ ورانہ تعارف شامل نہیں ہوا۔",
  t_profile_verification: "تصدیق",
  t_profile_approved: "منظور شدہ",
  t_profile_approved_on: "{date} کو منظور شدہ",
  t_profile_document: "دستاویز",
  t_profile_submitted: "جمع کرائی گئی",
  t_profile_member_since: "رکنیت از",

  // profile edit form
  t_pf_about_you: "اپنے بارے میں",
  t_pf_bio_placeholder: "مختصر پیشہ ورانہ تعارف جو آپ کے مریض دیکھیں گے۔",
  t_pf_change_picture: "تصویر تبدیل کریں",
  t_pf_upload_picture: "تصویر اپ لوڈ کریں",
  t_pf_remove_selected: "منتخب فائل ہٹائیں",
  t_pf_save: "تبدیلیاں محفوظ کریں",
  t_pf_saving: "محفوظ ہو رہا ہے...",
  t_pf_saved: "محفوظ ہو گیا",
  t_pf_error_save: "تبدیلیاں محفوظ نہیں ہو سکیں",
  t_pf_error_generic: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",

  // language preference
  t_lang_title: "زبان",
  t_lang_desc: "معالج ورک اسپیس کے لیے اپنی پسندیدہ زبان منتخب کریں۔",
  t_lang_saving: "محفوظ ہو رہا ہے...",

  // patient detail page
  t_pd_years: "{age} سال",
  t_pd_connected_since: "{date} سے منسلک",
  t_pd_this_week: "اس ہفتے",
  t_pd_week_line: "ہفتہ {week} · {range} · جاری",
  t_pd_stat_mood: "موڈ",
  t_pd_stat_sleep: "نیند کا معیار",
  t_pd_stat_journals: "جرنلز",
  t_pd_stat_quiz: "ہفتہ وار کوئز",
  t_pd_stat_exercises: "مشقیں",
  t_pd_stat_growth: "نشوونما",
  t_pd_days: "{days}/7 دن",
  t_pd_quiz_not_completed: "مکمل نہیں ہوا",
  t_pd_last_quiz_score: "آخری مکمل شدہ ہفتے کا اسکور {score}/{max}",
  t_pd_completed_this_week: "اس ہفتے مکمل ہوا",
  t_pd_exercises_none: "ابھی کچھ نہیں",
  t_pd_stage: "مرحلہ {n}",
  t_pd_fully_grown: "مکمل نشوونما",
  t_pd_more_to_next: "اگلے مرحلے تک {count} باقی · کل {total} پوائنٹس",
  t_pd_points_total: "کل {total} پوائنٹس",
  t_pd_tasks_title: "تفویض کردہ کام",
  t_pd_tasks_hint: "مریض یہ اپنے جرنل میں دیکھتا ہے اور وہیں مکمل کرتا ہے۔",
  t_pd_tasks_none: "ابھی کوئی فعال کام نہیں۔",
  t_pd_recently_completed: "حالیہ مکمل شدہ",
  t_pd_assigned: "{date} کو تفویض",
  t_pd_completed_via_journal: "{date} کو مکمل · جرنل کے ذریعے",
  t_pd_advice_title: "مشورہ",
  t_pd_advice_hint:
    "متعلقہ کالملی ماڈیول کے لنک کے ساتھ مریض کے ہوم پیج پر دکھایا جاتا ہے۔",
  t_pd_advice_none: "ابھی کوئی فعال مشورہ نہیں۔",
  t_pd_related_to: "متعلقہ: {module}",
  t_pd_shared: "{date} کو شیئر کیا",
  t_pd_remove: "ہٹائیں",
  t_pd_removing: "ہٹایا جا رہا ہے...",
  t_pd_feedback_title: "ہفتہ وار تاثرات",
  t_pd_previous_feedback: "سابقہ تاثرات",
  t_pd_feedback_week_line: "ہفتہ {week} · {range} · اپ ڈیٹ {date}",
  t_pd_quiz_title: "آنے والا ہفتہ وار کوئز",
  t_pd_latest_report: "تازہ ترین ہفتہ وار رپورٹ",
  t_pd_view_full_report: "مکمل رپورٹ دیکھیں",
  t_pd_report_week: "ہفتہ {week} · {range}",
  t_pd_no_report:
    "ابھی کوئی ہفتہ وار رپورٹ نہیں — پہلی رپورٹ کالملی کے ایک مکمل ہفتے کے بعد بنتی ہے۔",
  t_pd_focus_title: "کوئز کے توجہ کے پہلو",
  t_pd_focus_desc: "سب سے حالیہ ہفتہ وار کوئز کے اعلیٰ اسکور والے پہلو۔",
  t_pd_journals_title: "حالیہ جرنلز",
  t_pd_no_journals_week: "اس ہفتے کوئی جرنل نہیں — آخری اندراج {when} تھا۔",
  t_pd_no_journals: "مریض نے ابھی کوئی جرنل نہیں لکھا۔",
  t_pd_journal_meta: "{date} · موڈ {mood}/5 · نیند {sleep}/5",
  t_pd_feelings: "احساسات",
  t_pd_reflection: "غور و فکر",
  t_pd_todo: "کام:",
  t_pd_disclaimer:
    "یہ صفحہ مریض کے درج شدہ ہفتے کا خلاصہ ہے۔ یہ نہ لائیو نگرانی ہے اور نہ تشخیص۔",
  t_pd_view_patient: "مریض دیکھیں",

  // trends
  t_trend_up: "↑ پچھلے ہفتے کے مقابلے",
  t_trend_down: "↓ پچھلے ہفتے کے مقابلے",
  t_trend_flat: "≈ پچھلے ہفتے جیسا",

  // task form
  t_task_placeholder: "مثلاً «سونے سے پہلے 5 منٹ آہستہ سانس کی مشق کریں»",
  t_task_assign: "کام تفویض کریں",
  t_task_assigning: "تفویض ہو رہا ہے…",
  t_task_assigned: "کام تفویض ہو گیا — یہ مریض کے جرنل میں نظر آئے گا۔",
  t_task_error: "کام تفویض نہیں ہو سکا",

  // advice form
  t_advice_new: "نیا مشورہ",
  t_advice_related: "متعلقہ",
  t_advice_share: "مشورہ شیئر کریں",
  t_advice_sharing: "شیئر ہو رہا ہے...",
  t_advice_placeholder:
    "مثلاً جب آپ خود کو مغلوب محسوس کریں تو سانس کی مشق آزمائیں۔",
  t_advice_hint:
    "مشورہ کالملی کی خصوصیات سے متعلق ہونا چاہیے — مشقیں، جرنل یا ہفتہ وار کوئز۔ براہ کرم طبی یا تشخیصی ہدایات سے گریز کریں۔",
  t_advice_error: "مشورہ محفوظ نہیں ہو سکا",
  t_advice_error_generic: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",

  // feedback form (section titles reuse feedback_section_1..4)
  t_fb_hint: "اپنے انداز میں لکھیں — مریض اسے تاثرات کے تحت دیکھتا ہے۔",
  t_fb_saved: "محفوظ ہو گیا",
  t_fb_save_for: "ہفتہ {week} کے تاثرات محفوظ کریں",
  t_fb_saving: "محفوظ ہو رہا ہے...",
  t_fb_error: "تاثرات محفوظ نہیں ہو سکے",
  t_fb_error_generic: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",
  t_fb_placeholder_1: "درج شدہ سرگرمی کی بنیاد پر مریض کا ہفتہ مجموعی طور پر کیسا رہا؟",
  t_fb_placeholder_2: "کیا اچھا ہوا؟ اس ہفتے مریض نے کون سی خوبیاں دکھائیں؟",
  t_fb_placeholder_3: "آنے والے ہفتے میں کن پہلوؤں پر نرمی سے توجہ دی جائے؟",
  t_fb_placeholder_4: "اپنے الفاظ میں ذاتی رہنمائی۔",

  // quiz review
  t_qr_intro_ai: "ہفتہ {week} کے لیے AI کے تجویز کردہ سوالات۔",
  t_qr_intro_edited:
    "ہفتہ {week} کے لیے AI کے تجویز کردہ سوالات — آپ نے اس ہفتے کا کوئز تبدیل کر دیا ہے۔",
  t_qr_hint:
    "کسی سوال کو تبدیل کر کے اسے اپنا ورژن بنا لیں؛ جوں کا توں چھوڑ دیں تو مریض کو خودکار طور پر AI کا تجویز کردہ کوئز ملتا ہے۔",
  t_qr_question: "سوال {n}",
  t_qr_options: "اختیارات:",
  t_qr_save: "میرا ورژن محفوظ کریں",
  t_qr_saving: "محفوظ ہو رہا ہے...",
  t_qr_saved: "محفوظ ہو گیا — مریض کو ہفتہ {week} کے لیے آپ کا ورژن ملے گا۔",
  t_qr_unsaved: "اس ہفتے کے سوالات میں آپ کی غیر محفوظ تبدیلیاں ہیں۔",
  t_qr_error: "سوالات محفوظ نہیں ہو سکے",
  t_qr_error_generic: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",
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
