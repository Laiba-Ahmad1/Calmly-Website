import { AnxietyType } from "@/lib/anxiety";

export const quizOptions = [
  { text: "Never", score: 0 },
  { text: "Rarely", score: 1 },
  { text: "Sometimes", score: 2 },
  { text: "Often", score: 3 },
  { text: "Almost always", score: 4 },
];

export const quizQuestions = [
  // =====================================================
  // SOCIAL ANXIETY
  // =====================================================

  {
    question:
      "How often did you worry about being judged, embarrassed, or misunderstood by other people this week?",

    anxietyType: "social" as AnxietyType,

    dimension: "fear_of_judgment",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you avoid or delay talking to people because you felt anxious?",

    anxietyType: "social" as AnxietyType,

    dimension: "avoidance",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How anxious did you feel before or during social situations this week?",

    anxietyType: "social" as AnxietyType,

    dimension: "social_distress",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much did social anxiety affect your ability to participate in conversations, classes, gatherings, or other interactions?",

    anxietyType: "social" as AnxietyType,

    dimension: "social_functioning",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "After a social interaction, how often did you replay it in your mind or worry about how you came across?",

    anxietyType: "social" as AnxietyType,

    dimension: "post_event_worry",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you worry that other people would notice your nervousness or mistakes?",

    anxietyType: "social" as AnxietyType,

    dimension: "fear_of_judgment",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you choose not to join a conversation or social activity because you felt anxious?",

    anxietyType: "social" as AnxietyType,

    dimension: "avoidance",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you notice physical signs of anxiety, such as a racing heart, shaking, sweating, or blushing, during social situations?",

    anxietyType: "social" as AnxietyType,

    dimension: "physical_symptoms",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How difficult was it to speak, express your opinion, or ask a question when other people were present?",

    anxietyType: "social" as AnxietyType,

    dimension: "social_distress",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you continue thinking about something you said or did in a social situation after it was over?",

    anxietyType: "social" as AnxietyType,

    dimension: "post_event_worry",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you worry about making a poor impression when meeting someone new?",

    anxietyType: "social" as AnxietyType,

    dimension: "fear_of_judgment",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much did social anxiety interfere with activities that were important to you this week?",

    anxietyType: "social" as AnxietyType,

    dimension: "social_functioning",

    options: quizOptions,

    active: true,
  },

  // =====================================================
  // HEALTH ANXIETY
  // =====================================================

  {
    question:
      "How often did you worry that a physical sensation or symptom meant something was seriously wrong?",

    anxietyType: "health" as AnxietyType,

    dimension: "health_worry",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you check your body, symptoms, or health for reassurance this week?",

    anxietyType: "health" as AnxietyType,

    dimension: "body_checking",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How difficult was it to stop thinking about a health-related worry once it appeared?",

    anxietyType: "health" as AnxietyType,

    dimension: "worry_control",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you search for health information because you were worried about a symptom or illness?",

    anxietyType: "health" as AnxietyType,

    dimension: "reassurance_seeking",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much did health-related worry interfere with your daily activities, sleep, or ability to relax?",

    anxietyType: "health" as AnxietyType,

    dimension: "daily_impact",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you interpret a normal or minor physical sensation as a sign of a serious illness?",

    anxietyType: "health" as AnxietyType,

    dimension: "health_worry",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you repeatedly check a physical sensation or symptom to make sure it had not become worse?",

    anxietyType: "health" as AnxietyType,

    dimension: "body_checking",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you ask other people for reassurance about your health?",

    anxietyType: "health" as AnxietyType,

    dimension: "reassurance_seeking",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How difficult was it to focus on something else when you noticed a physical symptom?",

    anxietyType: "health" as AnxietyType,

    dimension: "health_worry",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you avoid an activity because you were worried it might affect your health?",

    anxietyType: "health" as AnxietyType,

    dimension: "avoidance",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did looking up health information temporarily reassure you but leave you worried again later?",

    anxietyType: "health" as AnxietyType,

    dimension: "reassurance_seeking",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much time did health-related worries take away from things you wanted or needed to do?",

    anxietyType: "health" as AnxietyType,

    dimension: "daily_impact",

    options: quizOptions,

    active: true,
  },

  // =====================================================
  // GENERAL ANXIETY
  // =====================================================

  {
    question:
      "How often did you feel worried or uneasy without a clear reason this week?",

    anxietyType: "general" as AnxietyType,

    dimension: "general_worry",

    options: quizOptions,

    active: true,
  },

  {
    question: "How difficult was it to stop worrying once a thought started?",

    anxietyType: "general" as AnxietyType,

    dimension: "worry_control",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you find yourself imagining that something might go wrong?",

    anxietyType: "general" as AnxietyType,

    dimension: "catastrophic_thinking",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much did anxiety affect your ability to concentrate, relax, or enjoy your day?",

    anxietyType: "general" as AnxietyType,

    dimension: "daily_impact",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much did anxiety affect your sleep, energy, or physical comfort this week?",

    anxietyType: "general" as AnxietyType,

    dimension: "physical_impact",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you worry about several different things during the same period?",

    anxietyType: "general" as AnxietyType,

    dimension: "general_worry",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you try to stop worrying but find that the thoughts kept returning?",

    anxietyType: "general" as AnxietyType,

    dimension: "worry_control",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did your mind jump to the worst possible outcome when something uncertain happened?",

    anxietyType: "general" as AnxietyType,

    dimension: "catastrophic_thinking",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you notice physical tension, restlessness, or difficulty settling down when anxious?",

    anxietyType: "general" as AnxietyType,

    dimension: "physical_impact",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did worrying make it difficult to focus on what you were doing?",

    anxietyType: "general" as AnxietyType,

    dimension: "concentration",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did worrying make it harder to fall asleep or stay asleep?",

    anxietyType: "general" as AnxietyType,

    dimension: "sleep_impact",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much did worrying interfere with things you wanted or needed to do this week?",

    anxietyType: "general" as AnxietyType,

    dimension: "daily_impact",

    options: quizOptions,

    active: true,
  },

  // =====================================================
  // STUDY-RELATED ANXIETY → GENERAL
  // =====================================================

  {
    question:
      "How often did you feel anxious or overwhelmed when thinking about your studies or academic responsibilities?",

    anxietyType: "general" as AnxietyType,

    dimension: "academic_worry",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did fear of failing or making mistakes make it difficult to study or start an assignment?",

    anxietyType: "general" as AnxietyType,

    dimension: "fear_of_failure",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How anxious did you feel before or during tests, presentations, or important academic tasks?",

    anxietyType: "general" as AnxietyType,

    dimension: "test_anxiety",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you procrastinate or avoid studying because you felt overwhelmed by it?",

    anxietyType: "general" as AnxietyType,

    dimension: "avoidance",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much did study-related anxiety affect your sleep, concentration, or ability to enjoy your free time?",

    anxietyType: "general" as AnxietyType,

    dimension: "academic_impact",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you feel overwhelmed by the amount of work you needed to complete?",

    anxietyType: "general" as AnxietyType,

    dimension: "academic_worry",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you worry that one mistake or poor result would negatively affect your future?",

    anxietyType: "general" as AnxietyType,

    dimension: "fear_of_failure",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did anxiety make it difficult to remember information during a test or presentation?",

    anxietyType: "general" as AnxietyType,

    dimension: "test_anxiety",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you delay an academic task even though you knew it was important?",

    anxietyType: "general" as AnxietyType,

    dimension: "avoidance",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did anxious thoughts interrupt your concentration while studying?",

    anxietyType: "general" as AnxietyType,

    dimension: "concentration",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you find yourself thinking about academic responsibilities when you were supposed to be resting?",

    anxietyType: "general" as AnxietyType,

    dimension: "academic_worry",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much did academic anxiety affect your enjoyment of activities outside of studying?",

    anxietyType: "general" as AnxietyType,

    dimension: "academic_impact",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you experience sudden periods of intense fear or panic this week?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "panic_symptoms",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you notice strong physical sensations during anxious moments, such as a racing heart, shortness of breath, dizziness, shaking, or sweating?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "panic_symptoms",

    options: quizOptions,

    active: true,
  },

  {
    question: "How often did you worry that another panic attack might happen?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "fear_of_next_attack",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you pay close attention to your body because you were afraid that physical sensations might lead to a panic attack?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "anticipatory_anxiety",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you avoid places, situations, activities, or being alone because you were afraid of having a panic attack?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "panic_avoidance",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you change your plans or routines because you were worried that you might have a panic attack?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "panic_avoidance",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you fear that you might lose control, faint, or be unable to cope during a panic episode?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "loss_of_control",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you feel on edge or watchful for signs that a panic attack might be starting?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "anticipatory_anxiety",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How difficult was it to return to your normal activities after experiencing intense anxiety or panic?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "daily_impact",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How much did fear of having a panic attack interfere with your work, studies, social activities, or other things that were important to you?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "daily_impact",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you seek reassurance from another person because you were afraid that something was wrong during an episode of intense anxiety?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "fear_of_next_attack",

    options: quizOptions,

    active: true,
  },

  {
    question:
      "How often did you find yourself thinking about a previous panic episode and worrying that it could happen again?",

    anxietyType: "panic attacks" as AnxietyType,

    dimension: "fear_of_next_attack",

    options: quizOptions,

    active: true,
  },
];
