import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  datetime,
  decimal,
  float,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  time,
  timestamp,
  tinyint,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const USER_DETAILS = mysqlTable('user_details', {
  id: int('id').autoincrement().notNull().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  gender: varchar('gender', { length: 150 }).default(null),
  mobile: varchar('mobile', { length: 100 }).default(null),
  birth_date: date('birth_date').default(null),
  password: varchar('password', { length: 150 }).default(null),
  username: varchar('username', { length: 150 }).default(null),
  education: varchar('education', { length: 200 }).default(null),
  student: mysqlEnum('student', ['yes', 'no']).notNull(),
  college: text('college').default(null),
  university: text('university').default(null),
  yearOfPassing: varchar('yearOfPassing', { length: 150 }).default(null),
  monthOfPassing: varchar('monthOfPassing', { length: 150 }).default(null),
  country: varchar('country', { length: 30 }).default(null),
  language: varchar('language', { length: 50 }).default('English'),
  education_country: varchar('education_country', { length: 100 }).default(null),
  education_level: varchar('education_level', { length: 255 }).default('Other'),
  experience: int('experience').default(null),
  education_qualification: varchar('education_qualification', { length: 255 }).default(null),
  current_job: varchar('current_job', { length: 200 }).default(null),
  // plan_type: mysqlEnum('plan_type', ['base', 'pro']).notNull().default('base'),
  plan_type: mysqlEnum('plan_type', ['base', 'pro']),
  joined_date: timestamp('joined_date').defaultNow(),
  account_status: mysqlEnum('account_status', ['linked', 'separated']),
  academicYearStart: varchar('academicYearStart', { length: 7 }).notNull(), // Format: YYYY-MM
  academicYearEnd: varchar('academicYearEnd', { length: 7 }).notNull(),     // Format: YYYY-MM
  grade: varchar('grade', { length: 100 }).default(null),
  institution_id: int('institution_id').references(() => INSTITUTION.id, { onDelete: 'set null' }).default(null),
  class_id: int('class_id').references(() => CLASS.id, { onDelete: 'set null' }).default(null),
  division_id: int('division_id').references(() => DIVISION.id, { onDelete: 'set null' }).default(null),
  institute_name: varchar("institute_name", { length: 255 }), /* for users whose school is not linked  */
  class_name: varchar("class_name", { length: 100 }), 
  user_role: mysqlEnum('user_role', ['Individual', 'Institutional']).notNull().default('Individual'),
  is_verified: boolean('is_verified').default(false),
  scope_type: mysqlEnum("scope_type", ["career", "cluster", "sector"]).notNull().default("career"),
});

export const USER_KEYS = mysqlTable("user_keys", {
  id: int("id").autoincrement().notNull().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(USER_DETAILS, "id", { onDelete: "cascade" }),
  unique_key: varchar("unique_key", { length: 50 }).notNull(),
});

// Define the schema for the 'page' table
export const PAGE = mysqlTable("page", {
  id: int("id").primaryKey().notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description").notNull(),
  start_date: datetime("start_date").notNull(),
  end_date: datetime("end_date").notNull(),
  icon: varchar("icon", { length: 150 }).notNull(),
  banner: varchar("banner", { length: 150 }).notNull(),
  active: mysqlEnum("active", ["yes", "no"]).notNull(),
  followers: int("followers").default(0).notNull(),
  type: varchar("type", { length: 150 }).notNull(),
  password: varchar("password", { length: 150 }).notNull(),
  super_admin: mysqlEnum("super_admin", ["no", "yes"]).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull(),
});

export const USER_EDUCATION_STAGE = mysqlTable("user_education_stage", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").unique().notNull().references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  stage: mysqlEnum("stage", ["school", "college", "completed_education"]).notNull(),
});

export const SCHOOL_EDUCATION = mysqlTable("school_education", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").unique().notNull().references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  is_higher_secondary: boolean("is_higher_secondary").notNull(),
  main_subject: varchar("main_subject", 255),
  description: text("description"),
});

export const USER_FEATURE_FLAGS = mysqlTable("user_feature_flags", {
  id: int("id").autoincrement().notNull().primaryKey(),
  user_id: int("user_id").notNull().references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 100 }).notNull(), // e.g., 'result_page_shown'
  seen: boolean("seen").notNull().default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  uniqueUserKey: unique().on(table.user_id, table.key),
}));

export const COLLEGE_EDUCATION = mysqlTable("college_education", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull().references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  degree: varchar("degree", 255).notNull(),
  field: varchar("field", 255).notNull(),
  year_of_study: int("year_of_study").default(null), // Removed .check()
  is_completed: boolean("is_completed").notNull().default(false),
  description: text("description"),
}, (table) => {
  return {
    yearOfStudyCheck: sql`CHECK (year_of_study BETWEEN 1 AND 10)`, // SQL constraint added
  };
});

export const COMPLETED_EDUCATION = mysqlTable("completed_education", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull().references(() => USERS.id, { onDelete: "cascade" }),
  degree: varchar("degree", 255).notNull(),
  field: varchar("field", 255).notNull(),
  description: text("description"),
});

export const WORK_EXPERIENCE = mysqlTable("work_experience", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull().references(() => USERS.id, { onDelete: "cascade" }),
  job_title: varchar("job_title", 255).notNull(),
  years_of_experience: int("years_of_experience").notNull(), // Removed .check()
}, (table) => {
  return {
    yearsOfExperienceCheck: sql`CHECK (years_of_experience >= 0)`, // Table-level CHECK constraint
  };
});


export const USER_SKILLS = mysqlTable("user_skills", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull().references(() => USERS.id, { onDelete: "cascade" }),
  skill_name: varchar("skill_name", 255).notNull(),
});

export const CAREER_PREFERENCES = mysqlTable("career_preferences", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").unique().references(() => users.id, { onDelete: "cascade" }),
  schoolPref: mysqlEnum("school_pref", ["subject_based", "personality_based", "mixed"]).default(null),
  collegePref: mysqlEnum("college_pref", ["education_based", "personality_based", "mixed"]).default(null),
  completedPref: mysqlEnum("completed_pref", ["education_based", "job_based", "personality_based", "mixed_all"]).default(null),
  noJobPref: mysqlEnum("no_job_pref", ["education_based", "personality_based", "mixed"]).default(null),
});

export const QUESTIONS = mysqlTable("questions", {
  id: int("id").primaryKey().autoincrement(),
  type: mysqlEnum("type", ["text", "audio", "video", "image"]).notNull(),
  timer: int("timer").notNull(),
  video: varchar("video", { length: 150 }),
  audio: varchar("audio", { length: 150 }),
  image: varchar("image", { length: 150 }),
  question: text("question").notNull(),
  challenge_id: int("challenge_id").notNull(),
  task_id: int("task_id").notNull(),
  option: mysqlEnum("option", ["normal", "poison", "bonus"]).notNull(),
  stars: int("stars").notNull().default(0),
  quiz_type: mysqlEnum("quiz_type", ["least", "most"]).notNull(),
});

export const ANSWERS = mysqlTable("answers", {
  id: int("id").primaryKey().autoincrement(),
  question_id: int("question_id").notNull(),
  answer_text: text("answer_text").notNull(),
  answer: mysqlEnum("answer", ["no", "yes"]).notNull(),
  task_marks: decimal("task_marks", { precision: 10, scale: 2 }),
});

export const TASKS = mysqlTable("tasks", {
  task_id: int("task_id").primaryKey().autoincrement(),
  challenge_id: int("challenge_id").notNull(),
  task_name: varchar("task_name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  start_date: datetime("start_date").notNull(),
  start_time: time("start_time").notNull(),
  end_date: datetime("end_date").notNull(),
  end_time: time("end_time").notNull(),
  task_type: varchar("task_type", { length: 100 }).notNull(),
  verification_method: varchar("verification_method", { length: 15 }).notNull(),
  entry_points: int("entry_points", { maxValue: 100, minValue: 1 }).notNull(),
  reward_points: int("reward_points", { maxValue: 100, minValue: 1 }).notNull(),
  reward_cash: int("reward_cash", { maxValue: 100, minValue: 1 }).notNull(),
  verification_points: int("verification_points", {
    maxValue: 100,
    minValue: 1,
  }).notNull(),
  is_certificate: varchar("is_certificate", { length: 15 }).notNull(),
  is_badge: varchar("is_badge", { length: 15 }).notNull(),
  player_level: varchar("player_level", { length: 15 }).notNull(),
  created_date: datetime("created_date").notNull(),
  created_by: varchar("created_by", { length: 100 }).notNull(),
  participants_count: int("participants_count").notNull(),
  active: mysqlEnum("active", ["yes", "no"]).notNull(),
  removed_date: datetime("removed_date"),
  removed_by: varchar("removed_by", { length: 100 }),
  day: int("day").notNull().default(0),
  win_mark: int("win_mark").notNull(),
  quiz_type: mysqlEnum("quiz_type", ["normal", "psychological"]).notNull(),
  task_percent: int("task_percent", { maxValue: 100, minValue: 1 })
    .notNull()
    .default(0),
  task_variety: mysqlEnum("task_variety", ["technical", "aptitude"]).notNull(),
  live: mysqlEnum("live", ["yes", "no"]).notNull(),
  rank: int("rank").notNull().default(10),
});

// Define the schema for the 'challenges' table
export const CHALLENGES_MAIN = mysqlTable("challenges_main", {
  challenge_id: int("challenge_id").primaryKey().autoincrement(),
  page_id: int("page_id").notNull(),
  career_group_id: int("career_group_id").references(() => CAREER_GROUP.id),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  challenge_type: mysqlEnum("challenge_type", [
    "ordered",
    "unordered",
  ]).notNull(),
  frequency: mysqlEnum("frequency", [
    "challenges",
    "daily",
    "bootcamp",
    "contest",
    "treasure",
    "referral",
    "streak",
    "refer",
    "quiz",
    "food",
    "experience",
  ]).notNull(),
  start_date: datetime("start_date").notNull(),
  start_time: time("start_time").notNull(),
  end_date: datetime("end_date").notNull(),
  end_time: time("end_time").notNull(),
  entry_points: int("entry_points").notNull(),
  reward_points: int("reward_points").notNull(),
  level: int("level").default(1).notNull(),
  created_by: varchar("created_by", { length: 100 }).notNull(),
  created_date: datetime("created_date").notNull(),
  participants_count: int("participants_count").default(0).notNull(),
  removed_date: datetime("removed_date"),
  removed_by: varchar("removed_by", { length: 100 }),
  arena: mysqlEnum("arena", ["no", "yes"]).notNull(),
  district_id: int("district_id"),
  visit: mysqlEnum("visit", ["no", "yes"]).notNull(),
  active: mysqlEnum("active", ["no", "yes"]).notNull(),
  days: int("days").default(0).notNull(),
  referral_count: int("referral_count").default(0).notNull(),
  open_for: mysqlEnum("open_for", [
    "everyone",
    "location",
    "specific",
  ]).notNull(),
  like_based: mysqlEnum("like_based", ["no", "yes"]).notNull(),
  live: mysqlEnum("live", ["no", "yes"]).notNull(),
  questions: int("questions").default(0).notNull(),
  exp_type: mysqlEnum("exp_type", [
    "biriyani",
    "arts",
    "breakfast",
    "entertainment",
  ]).notNull(),
  rewards: mysqlEnum("rewards", ["no", "yes"]).notNull(),
  dep_id: int("dep_id").notNull(),
  page_type: mysqlEnum("page_type", [
    "job",
    "internship",
    "tests",
    "language",
    "compatibility",
  ]).notNull(),
  rounds: int("rounds").notNull(),
  start_datetime: datetime("start_datetime").default(new Date()).notNull(),
  language_id: int("language_id").notNull(),
});

export const ANALYTICS_QUESTION = mysqlTable("analytics_question", {
  id: int("id").primaryKey().autoincrement(),
  question_text: varchar("question_text", { length: 300 }).notNull(),
  quiz_id: int("quiz_id").notNull(),
});

export const OPTIONS = mysqlTable("options", {
  id: int("id").primaryKey().autoincrement(),
  option_text: varchar("option_text", { length: 300 }).notNull(),
  analytic_id: int("analytic_id").notNull(),
  question_id: int("question_id").notNull(),
});
export const OPTIONS_KIDS = mysqlTable("options_kids", {
  id: int("id").primaryKey().autoincrement(),
  option_text: varchar("option_text", { length: 300 }).notNull(),
  analytic_id: int("analytic_id").notNull(),
  question_id: int("question_id").notNull(),
});

export const USER_PROGRESS = mysqlTable("user_progress", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  question_id: int("question_id").notNull(),
  option_id: int("option_id").notNull(),
  analytic_id: int("analytic_id").notNull(),
  created_at: datetime("created_at").notNull(),
});

export const USER_CAREER_PROGRESS = mysqlTable("user_career_progress", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  question_id: int("question_id").notNull(),
  option_id: int("option_id").notNull(),
  personality_type_id: int("personality_type_id").notNull(),
  created_at: datetime("created_at").notNull(),
});

export const RESULTS1 = mysqlTable("result1", {
  id: int("id").primaryKey().notNull(),
  type_sequence: varchar("type_sequence", { length: 4 }).notNull(),
  description: text("description").default(null),
  strengths: text("strengths").default(null),
  weaknesses: text("weaknesses").default(null),
  opportunities: text("opportunities").default(null),
  threats: text("threats").default(null),
  most_suitable_careers: text("most_suitable_careers").default(null),
  least_suitable_careers: text("least_suitable_careers").default(null),
});

export const QUIZZES = mysqlTable("quizzes", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
});

export const PERSONALITY_TYPES = mysqlTable("personality_types", {
  id: int("id").primaryKey().autoincrement(),
  type_code: varchar("type_code", { length: 10 }).notNull(),
  type_name: varchar("type_name", { length: 50 }).notNull(),
});

export const PERSONALITY_QUESTIONS = mysqlTable("personality_questions", {
  id: int("id").primaryKey().autoincrement(),
  question_text: text("question_text").notNull(),
  quiz_id: int("quiz_id")
    .notNull()
    .references(() => QUIZZES.id),
  personality_types_id: int("personality_types_id")
    .notNull()
    .references(() => PERSONALITY_TYPES.id),
});
export const PERSONALITY_QUESTIONS_KIDS = mysqlTable(
  "personality_questions_kids",
  {
    id: int("id").primaryKey().autoincrement(),
    question_text: text("question_text").notNull(),
    quiz_id: int("quiz_id")
      .notNull()
      .references(() => QUIZZES.id),
    personality_types_id: int("personality_types_id")
      .notNull()
      .references(() => PERSONALITY_TYPES.id),
  }
);

export const PERSONALITY_CHOICES = mysqlTable("personality_choices", {
  id: int("id").primaryKey().autoincrement(),
  choice_text: varchar("choice_text", { length: 50 }).notNull(),
});

export const QUIZ_SEQUENCES = mysqlTable("quiz_sequences", {
  id: int("id").primaryKey().autoincrement(),
  type_sequence: text("type_sequence").notNull().default(""),
  user_id: int("user_id").notNull(),
  quiz_id: int("quiz_id").notNull(), // New column for quiz identification
  createddate: datetime("createddate").notNull(),
  isCompleted: boolean("isCompleted").notNull().default(false), // New boolean column
  isStarted: boolean("isStarted").notNull().default(false), // New boolean column
});

export const USER_ASSESSMENT_REPORTS = mysqlTable('user_assessment_reports', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int("user_id").references(() => USER_DETAILS.id).notNull(),
  assessment_date: timestamp('assessment_date').defaultNow(),
  is_kid: int('is_kid').notNull(), // 1 = kid, 0 = adult
  // Main report data in JSON
  report_data: json('report_data').notNull(), // Entire response stored here

  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').onUpdateNow().defaultNow(),
});

export const FEEDBACK = mysqlTable("feedback", {
  user_id: int("user_id")
    .primaryKey()
    .references(() => USER_DETAILS.id)
    .notNull(),
  rating: int("rating").notNull(),
  description: text("description").default(null),
});

export const USER_CAREER = mysqlTable("user_career", {
  id: int("id").notNull().autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  career_group_id: int("career_group_id")
    .notNull()
    .references(() => CAREER_GROUP.id),
  reason_for_recommendation: text("reason_for_recommendation").default(null),
  present_trends: text("present_trends").default(null),
  future_prospects: text("future_prospects").default(null),
  user_description: text("user_description").default(null),
  created_at: timestamp("created_at").defaultNow(),
  type2: varchar("type2", { length: 255 }).notNull(),
  type1: varchar("type1", { length: 255 }).notNull(),
  country: text("country").default(null),
  feedback: text("feedback").default(null),
});

export const USER_CAREER_STATUS = mysqlTable("user_career_status", {
  id: int("id").autoincrement().notNull().primaryKey(),
  user_career_id: varchar("user_career_id", { length: 36 })
    .notNull()
    .references(() => USER_CAREER.id),
  roadmap_status: mysqlEnum("roadmap_status", [
    "not_started",
    "in_progress",
    "completed",
  ])
    .default("not_started")
    .notNull(),
  created_at: timestamp("created_at").defaultNow(), // Automatically set to current timestamp when created
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(), // Automatically updated to current timestamp on update
});

// export const CAREER_NEWS = mysqlTable("career_news", {
//   id: int("id").notNull().autoincrement().primaryKey(),
//   career_id: int("career_id").notNull().references(() => CAREER_GROUP.id),  // Connects to the career
//   title: varchar("title", { length: 255 }).notNull(),                      // News title
//   summary: text("summary").notNull(),                                      // Brief summary of the news
//   source_url: varchar("source_url", { length: 500 }).notNull(),            // Link to the full news
//   published_at: timestamp("published_at").notNull(),                       // News publish date
//   status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
//   created_at: timestamp("created_at").defaultNow(),
//   updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
// });

export const CAREER_NEWS = mysqlTable("career_news", {
  id: int("id").notNull().autoincrement().primaryKey(),
  scope_id: int("scope_id").notNull(), // Generic ID
  scope_type: mysqlEnum("scope_type", ["career", "cluster", "sector"]).notNull(), // Enum for scope type
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  source_url: varchar("source_url", { length: 500 }).notNull(),
  published_at: timestamp("published_at").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});


export const STRENGTH_TYPES = mysqlTable("strength_types", {
  id: int("id").primaryKey().autoincrement(),
  type_code: varchar("type_code", { length: 10 }).notNull(),
  type_name: varchar("type_name", { length: 50 }).notNull(),
});

export const STRENGTH_QUESTIONS = mysqlTable("strength_questions", {
  id: int("id").primaryKey().autoincrement(),
  question_text: text("question_text").notNull(),
  quiz_id: int("quiz_id")
    .notNull()
    .references(() => QUIZZES.id),
  strength_types_id: int("strength_types_id")
    .notNull()
    .references(() => STRENGTH_TYPES.id),
});

export const STRENGTH_CHOICES = mysqlTable("strength_choices", {
  id: int("id").primaryKey().autoincrement(),
  choice_text: varchar("choice_text", { length: 50 }).notNull(),
});

export const STRENGTH_QUIZ_PROGRESS = mysqlTable("strength_quiz_progress", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  question_id: int("question_id").notNull(),
  option_id: int("option_id").notNull(),
  strength_type_id: int("strength_type_id").notNull(),
  created_at: datetime("created_at").notNull(),
});

export const USER_RESULTS = mysqlTable("user_results", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id")
    .primaryKey()
    .references(() => USER_DETAILS.id)
    .notNull(),
  result2: text("result2").default(null),
  quiz_id: int("quiz_id"),
  type: mysqlEnum("type", ["basic", "advance"]).default("basic"),
  country: varchar("country", 255).default(null),
});

export const ANALYTICS_QUESTION_KIDS = mysqlTable("analytics_question_kids", {
  id: int("id").primaryKey().autoincrement(),
  question_text: varchar("question_text", { length: 300 }).notNull(),
  quiz_id: int("quiz_id").notNull(),
});

export const CAREER_GROUP = mysqlTable("career_group", {
  id: int("id").notNull().autoincrement().primaryKey(),
  career_name: varchar("career_name", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Define the `user_progress` table schema
export const QUIZ_PROGRESS = mysqlTable("quiz_progress", {
  id: int("id").primaryKey().autoincrement(), // AUTO_INCREMENT primary key
  question_id: int("question_id").notNull(), // Foreign key to questions table
  answer_id: int("answer_id").notNull(), // Foreign key to answers table
  user_id: int("user_id").notNull(), // Foreign key to users table
  marks: decimal("marks", 10, 3).notNull(), // Decimal column with precision (10, 3)
  created_at: timestamp("created_at").defaultNow(), // Creation timestamp with default current timestamp
  challenge_id: int("challenge_id").notNull(), // Foreign key to challenge table
  task_id: int("task_id").notNull(), // Foreign key to tasks table
});

export const USER_TASKS = mysqlTable("user_tasks", {
  id: int("id").primaryKey().autoincrement(),
  task_id: int("task_id").notNull(),
  user_id: int("user_id").notNull(),
  reward_points: int("reward_points").default(0),
  approved: mysqlEnum("approved", ["nill", "yes", "no"]).notNull(),
  entry_points: int("entry_points").default(0).notNull(),
  rejected: mysqlEnum("rejected", ["no", "yes"]).notNull(),
  start_date: datetime("start_date").default(new Date()).notNull(),
  start_time: time("start_time").default(null),
  end_date: datetime("end_date").default(null),
  end_time: time("end_time").default(null),
  steps: int("steps").default(0),
  approved_by: varchar("approved_by", { length: 100 }).default(null),
  completed: mysqlEnum("completed", ["no", "yes"]).notNull(),
  arena: mysqlEnum("arena", ["no", "yes"]).notNull(),
  challenge_id: int("challenge_id").notNull(),
  image: varchar("image", { length: 150 }).default(null),
  video: varchar("video", { length: 150 }).default(null),
  day: int("day").default(0).notNull(),
  started: mysqlEnum("started", ["no", "yes"]).notNull(),
});

export const TEMP_LEADER = mysqlTable("temp_leader", {
  id: int("id").primaryKey().autoincrement(),
  marks: decimal("marks", 10, 3).notNull(),
  userId: int("user_id").notNull(),
  challengeId: int("challenge_id").notNull(),
  taskId: int("task_id").notNull(),
});

export const SUBJECTS = mysqlTable("subjects", {
  subject_id: int("subject_id").primaryKey().autoincrement(),
  subject_name: varchar("subject_name", { length: 255 }).notNull().unique(),
  min_age: int("min_age").notNull(),
  max_age: int("max_age").notNull(),
  class_name: varchar("class_name", { length: 255 }).notNull(),
});

// export const CAREER_SUBJECTS = mysqlTable(
//   "career_subjects",
//   {
//     career_id: int("career_id")
//       .notNull()
//       .references(() => CAREER_GROUP.id /* { onDelete: 'cascade' } */), // Reference to CAREER_GROUP now
//     subject_id: int("subject_id")
//       .notNull()
//       .references(() => SUBJECTS.subject_id /* { onDelete: 'cascade' } */), // Foreign key to Subjects table
//   },
//   (table) => {
//     return {
//       pk: primaryKey(table.career_id, table.subject_id), // Composite primary key
//     };
//   }
// );

export const CAREER_SUBJECTS = mysqlTable(
  "career_subjects",
  {
    scope_id: int("scope_id").notNull(),
    scope_type: mysqlEnum("scope_type", ["career", "cluster", "sector"]).notNull(),
    subject_id: int("subject_id")
      .notNull()
      .references(() => SUBJECTS.subject_id),
  },
  (table) => {
    return {
      pk: primaryKey(table.scope_id, table.scope_type, table.subject_id),
    };
  }
);


export const TESTS = mysqlTable("tests", {
  test_id: int("test_id").autoincrement().primaryKey(),
  subject_id: int("subject_id")
    .notNull()
    .references(() => SUBJECTS.subject_id),
  test_date: date("test_date").notNull(),
  age_group: int("age_group").notNull(),
  year: int("year").notNull(),
  month: int("month").notNull(),
  week_number: int("week_number").notNull(),
  class_name: varchar("class_name", { length: 255 }).notNull(), /* added new fiewld for tests consistency */
  created_at: timestamp("created_at").defaultNow(),
});

export const USER_SUBJECT_COMPLETIONUSER_TESTS = mysqlTable("user_tests", {
  user_test_id: int("user_test_id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id),
  test_id: int("test_id")
    .notNull()
    .references(() => TESTS.test_id),
  score: int("score").default(null),
  stars_awarded: int("stars_awarded").default(null),
  completed: mysqlEnum("completed", ["no", "yes"]).notNull(),
});

export const STAR_CRITERIA = mysqlTable("star_criteria", {
  criteria_id: int("criteria_id").autoincrement().primaryKey(),
  test_id: int("test_id")
    .notNull()
    .references(() => TESTS.test_id),
  min_score: int("min_score").notNull(),
  stars: int("stars").notNull(),
});

export const TEST_QUESTIONS = mysqlTable("test_questions", {
  id: int("id").primaryKey().autoincrement(),
  timer: int("timer").notNull(),
  question: text("question").notNull(),
  test_id: int("test_id")
    .notNull()
    .references(() => TESTS.test_id),
});

export const TEST_ANSWERS = mysqlTable("test_answers", {
  id: int("id").primaryKey().autoincrement(),
  test_questionId: int("test_questionId")
    .notNull()
    .references(() => TEST_QUESTIONS.id),
  test_id: int("test_id")
    .notNull()
    .references(() => TESTS.test_id),
  answer_text: text("answer_text").notNull(),
  answer: mysqlEnum("answer", ["no", "yes"]).notNull(),
  // test_marks: decimal('task_marks', { precision: 10, scale: 2 }),
});

// Define the `user_progress` table schema
export const TEST_PROGRESS = mysqlTable("test_progress", {
  id: int("id").primaryKey().autoincrement(),
  test_questionId: int("question_id")
    .notNull()
    .references(() => TEST_QUESTIONS.id),
  test_answerId: int("answer_id"),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id),
  created_at: timestamp("created_at").defaultNow(),
  test_id: int("test_id")
    .notNull()
    .references(() => TESTS.test_id),
  marks: decimal("marks", 10, 3).notNull(),
  is_answer: mysqlEnum("is_answer", ["yes", "no"]).notNull(), // Answer field
});

export const STAR_PERCENT = mysqlTable("star_percent", {
  id: int("id").primaryKey().autoincrement(),
  min_percentage: decimal("min_percentage", 5, 2).notNull(),
  stars: int("stars").notNull(),
});

export const ACTIVITIES = mysqlTable("activities", {
  id: int("id").notNull().primaryKey().autoincrement(),
  activity_id: int("activity_id").notNull(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id),
  career_id: int("career_id")
    .notNull()
    .references(() => CAREER_GROUP.id),
  step: int("step").notNull(),
  activity_text: text("activity_text").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const SCHOOL = mysqlTable('school', {
  id: int('id').notNull().autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  address: varchar('address', { length: 255 }),
  contact_info: varchar('contact_info', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
});

export const USER_ACTIVITIES = mysqlTable("user_activities", {
  id: int("id").notNull().primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  activity_id: int("activity_id").notNull(),
  status: mysqlEnum("status", ["active", "completed", "skipped"]).notNull(),
  updated_at: timestamp("updated_at").defaultNow(),
});

//   export const SCHOOL = mysqlTable('school', {
//     id: int('id').notNull().primaryKey().autoincrement(),
//     title: varchar('title', 255).notNull(),
//     image: varchar('image', 255),
//     bgImg: varchar('bgImg', 255),
//     type:  mysqlEnum('type',['paid','free','disabled']).notNull(),
//   });

// export const SCHOOL = mysqlTable("school", {
//   id: int("id").notNull().autoincrement().primaryKey(),
//   name: varchar("name", { length: 100 }).notNull(),
//   address: varchar("address", { length: 255 }),
//   contact_info: varchar("contact_info", { length: 50 }),
//   created_at: timestamp("created_at").defaultNow(),
// });

// export const MODERATOR = mysqlTable("moderator", {
//   id: int("id").notNull().autoincrement().primaryKey(),
//   name: varchar("name", { length: 100 }).notNull(),
//   username: varchar("username", { length: 100 }).unique().notNull(),
//   school_id: int("school_id").references(() => SCHOOL.id, {
//     onDelete: "cascade",
//   }),
//   role: mysqlEnum("role", ["Teacher", "ClassAdmin"]).notNull(),
//   created_at: timestamp("created_at").defaultNow(),
// });

// export const CLASS = mysqlTable("class", {
//   id: int("id").notNull().autoincrement().primaryKey(),
//   name: varchar("name", { length: 50 }).notNull(),
//   school_id: int("school_id").references(() => SCHOOL.id, {
//     onDelete: "cascade",
//   }),
//   created_at: timestamp("created_at").defaultNow(),
// });

// export const DIVISION = mysqlTable("division", {
//   id: int("id").notNull().autoincrement().primaryKey(),
//   name: varchar("name", { length: 10 }).notNull(),
//   class_id: int("class_id").references(() => CLASS.id, { onDelete: "cascade" }),
//   created_at: timestamp("created_at").defaultNow(),
// });

// export const CLASS_MODERATOR = mysqlTable("class_moderator", {
//   id: int("id").notNull().autoincrement().primaryKey(),
//   class_id: int("class_id")
//     .notNull()
//     .references(() => CLASS.id, { onDelete: "cascade" }),
//   moderator_id: int("moderator_id")
//     .notNull()
//     .references(() => MODERATOR.id, { onDelete: "cascade" }),
//   division_id: int("division_id").references(() => DIVISION.id, {
//     onDelete: "cascade",
//   }),
//   created_at: timestamp("created_at").defaultNow(),
// });

// export const CHALLENGES = mysqlTable("challenges", {
//   id: int("id").notNull().primaryKey().autoincrement(),
//   age: int("age").notNull(),
//   country: varchar("country", 255).notNull(),
//   career_id: int("career_id").notNull(),
//   week: int("week").notNull(),
//   class_name: varchar("class_name", { length: 255 }).notNull(),
//   created_at: timestamp("created_at").defaultNow().notNull(),
//   challenge: varchar("challenge", 255).notNull(),
//   verification: varchar("verification", 255).notNull(),
// });

export const CHALLENGES = mysqlTable("challenges", {
  id: int("id").notNull().primaryKey().autoincrement(),
  age: int("age").notNull(),
  country: varchar("country", 255).notNull(),
  scope_id: int("scope_id").notNull(), // replaces career_id
  scope_type: mysqlEnum("scope_type", ["career", "cluster", "sector"]).notNull(),
  week: int("week").notNull(),
  class_name: varchar("class_name", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  challenge: varchar("challenge", 255).notNull(),
  verification: varchar("verification", 255).notNull(),
});


//   export const Moderator = mysqlTable('Moderator', {
//     id: int('id').notNull().primaryKey().autoincrement(),
//     school_id: int('school_id').notNull().references(() => SCHOOL.id),
//     title: varchar('title', 255).notNull(),
//     name: varchar('name', 255).notNull(),
//   });

export const CHALLENGE_PROGRESS = mysqlTable("challenge_progress", {
  id: int("id").notNull().primaryKey().autoincrement(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id),
  challenge_id: int("challenge_id")
    .notNull()
    .references(() => CHALLENGES.id),
  image: varchar("image", 255).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  age: int("age").notNull(),
  school_id: int("school_id").notNull(),
  week: int("week").notNull(),
});
export const MILESTONE_CATEGORIES = mysqlTable("milestone_categories", {
  id: int("id").notNull().autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export const MILESTONE_SUBCATEGORIES = mysqlTable("milestone_subcategories", {
  id: int("id").notNull().autoincrement().primaryKey(),
  category_id: int("category_id")
    .notNull()
    .references(() => MILESTONE_CATEGORIES.id), // Links to milestone_categories
  name: varchar("name", { length: 255 }).notNull(), // Subcategory names like 'Academic', 'Certification'
});

export const MILESTONES = mysqlTable("milestones", {
  id: int("id").notNull().autoincrement().primaryKey(),
  category_id: int("category_id")
    .notNull()
    .references(() => MILESTONE_CATEGORIES.id), // Category reference
  subcategory_id: int("subcategory_id")
    .default(null)
    .references(() => MILESTONE_SUBCATEGORIES.id), // New subcategory reference
  description: text("description").default(null),
  completion_status: boolean("completion_status").default(false),
  date_achieved: timestamp("date_achieved").default(null),
  milestone_age: decimal("milestone_age", { precision: 3, scale: 1 }).default(
    null
  ),
});

// export const USER_MILESTONES = mysqlTable("user_milestones", {
//   id: int("id").notNull().autoincrement().primaryKey(),
//   user_career_id: int("user_career_id")
//     .notNull()
//     .references(() => USER_CAREER.id),
//   milestone_id: int("milestone_id")
//     .notNull()
//     .references(() => MILESTONES.id),
// });

export const USER_MILESTONES = mysqlTable("user_milestones", {
  id: int("id").notNull().autoincrement().primaryKey(),
  scope_id: int("scope_id").notNull(), // replaces user_career_id
  scope_type: mysqlEnum("scope_type", ["career", "cluster", "sector"]).notNull(),
  milestone_id: int("milestone_id")
    .notNull()
    .references(() => MILESTONES.id),
});

export const USER_RESULT_CAREER = mysqlTable("user_result_career", {
  id: int("id").autoincrement().notNull().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id), // This will reference the user's ID from USER_DETAILS
  career_name: varchar("career_name", { length: 150 }).notNull(),
  description: text("description").default(null),
});

export const CAREER_PATH = mysqlTable("career_path", {
  id: int("id").notNull().autoincrement().primaryKey(), // Auto-increment primary key
  user_career_id: int("user_career_id")
    .notNull()
    .references(() => USER_CAREER.id), // Foreign key reference to user_career table
  overview: text("overview").notNull(), // Overview field
  education: text("education").notNull(), // Education field
  specialized_skills_development: text(
    "specialized_skills_development"
  ).notNull(), // Specialized skills development field
  entry_level_jobs: text("entry_level_jobs").notNull(), // Entry-level jobs field
  mid_level_career: text("mid_level_career").notNull(), // Mid-level career field
  senior_roles: text("senior_roles").notNull(), // Senior roles field
  entrepreneurial_path: text("entrepreneurial_path").default(null), // Optional entrepreneurial path field
  key_learning_milestones: text("key_learning_milestones").notNull(), // Key learning milestones field
  challenges: text("challenges").notNull(), // Challenges field
  opportunities: text("opportunities").notNull(), // Opportunities field
  future_prospects: text("future_prospects").notNull(), // Future prospects field
  career_path_summary: text("career_path_summary").notNull(), // Career path summary field
});

export const SUBJECT_QUIZ = mysqlTable("subject_quiz", {
  id: int("id").autoincrement().notNull().primaryKey(), // Auto-increment primary key
  question: text("question").notNull(), // Question field
  subject_id: int("subject_id")
    .notNull()
    .references(() => SUBJECTS.subject_id),
  age: int("age").notNull(), // Age field
  created_at: timestamp("created_at").defaultNow(), // Automatically set to current timestamp when created
});

export const SUBJECT_QUIZ_OPTIONS = mysqlTable("subject_quiz_options", {
  id: int("id").autoincrement().notNull().primaryKey(), // Auto-increment primary key
  question_id: int("question_id")
    .notNull()
    .references(() => SUBJECT_QUIZ.id), // Foreign key reference to subject_quiz
  option_text: text("option_text").notNull(), // Option text field
  is_answer: mysqlEnum("is_answer", ["yes", "no"]).notNull(), // Answer field
  created_at: timestamp("created_at").defaultNow(), // Automatically set to current timestamp when created
});

export const SUBJECT_USER_PROGRESS = mysqlTable("subject_user_progress", {
  id: int("id").autoincrement().notNull().primaryKey(), // Auto-increment primary key
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id),
  quiz_id: int("quiz_id")
    .notNull()
    .references(() => SUBJECT_QUIZ.id), // Foreign key reference to subject_quiz
  subject_id: int("subject_id")
    .notNull()
    .references(() => SUBJECTS.subject_id),
  option_id: int("option_id").notNull(), // Option ID field
  is_answer: mysqlEnum("is_answer", ["yes", "no"]).notNull(), // Answer field
  created_at: timestamp("created_at").defaultNow(), // Automatically set to current timestamp when created
});

export const USER_SUBJECT_COMPLETION = mysqlTable("user_subject_completion", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id), // Assuming USER_DETAILS has an 'id'
  skilled_age: int("skilled_age").default(null),
  test_id: int("test_id")
    .notNull()
    .references(() => TESTS.test_id),
  isStarted: boolean("isStarted").notNull().default(false), // New boolean column
  completed: mysqlEnum("completed", ["yes", "no"]).notNull(),
  score: int("score").default(null),
  stars_awarded: int("stars_awarded").default(null),
  created_at: timestamp("created_at").defaultNow(),
});

// export const COMMUNITY = mysqlTable("community", {
//   id: int("id").autoincrement().notNull().primaryKey(),
//   career: varchar("career", { length: 255 }).notNull(),
//   career_id: int("career_id").notNull().references(() => CAREER_GROUP.id),
//   global: mysqlEnum("global", ["yes", "no"]).notNull().default("no"),
//   student: mysqlEnum("student", ["no", "yes"]).notNull().default("no"),
//   country: varchar("country", { length: 100 }).default(null),
//   created_at: timestamp("created_at").defaultNow(),
//   updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
// });

export const COMMUNITY = mysqlTable("community", {
  id: int("id").autoincrement().notNull().primaryKey(),
  scope_id: int("scope_id").notNull(),
  scope_type: mysqlEnum("scope_type", ["career", "cluster", "sector"]).notNull(),
  career: varchar("career", { length: 255 }).notNull(), /* It can be anything creer, sector, cluster */
  global: mysqlEnum("global", ["yes", "no"]).notNull().default("no"),
  student: mysqlEnum("student", ["no", "yes"]).notNull().default("no"),
  country: varchar("country", { length: 100 }).default(null),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});


export const USER_COMMUNITY = mysqlTable(
  "user_community",
  {
    id: int("id").autoincrement().notNull().primaryKey(),
    user_id: int("user_id")
      .notNull()
      .references(() => USER_DETAILS.id, { onDelete: "cascade" }),
    community_id: int("community_id")
      .notNull()
      .references(() => COMMUNITY.id, { onDelete: "cascade" }),
    country: varchar("country", { length: 100 }).default(null),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userCommunityUnique: uniqueIndex("user_community_unique_idx", [
      "user_id",
      "community_id",
    ]),
  })
);

export const COMMUNITY_POST = mysqlTable("community_post", {
  id: int("id").autoincrement().notNull().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  community_id: int("community_id")
    .notNull()
    .references(() => COMMUNITY.id, { onDelete: "cascade" }),
  file_url: varchar("file_url", { length: 255 }).default(null), // Field to store file path or filename
  caption: text("caption").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // New field to store the post type (image, video, or text)
  post_category: mysqlEnum("post_category", ["certification", "milestone", "post"])   // New field for category
    .notNull()
    .default("post"),   
  created_at: timestamp("created_at").defaultNow(),
});

// export const USER_COURSE_PROGRESS = mysqlTable('user_course_progress', {
//     id: int('id').primaryKey().autoincrement(),
//     user_id: int('user_id').notNull().references(() => USER_DETAILS.id, { onDelete: 'cascade' }),
//     certification_id: int('certification_id').notNull().references(() => CERTIFICATIONS.id, { onDelete: 'cascade' }),
//     status: mysqlEnum('status', ['in_progress', 'completed']).notNull(), // Enum for course status
//     enrolled_date: timestamp('enrolled_date').defaultNow(),// timestamp for when the course was enrolled
//     completion_date: timestamp('completion_date').defaultNow().onUpdateNow(), // Timestamp for updates
// });

export const INSTITUTION = mysqlTable('institution', {
  id: int('id').notNull().autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  address: varchar('address', { length: 255 }),
  contact_info: varchar('contact_info', { length: 50 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(), // Hashed password
  type: mysqlEnum('type', ['School', 'College']).notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const MODERATOR = mysqlTable('moderator', {
  id: int('id').notNull().autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  // username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(), // Hashed password
  institution_id: int('institution_id').references(() => INSTITUTION.id, { onDelete: 'cascade' }),
  role: mysqlEnum('role', ['Admin', 'ClassAdmin']).notNull(),
  is_verified: boolean('is_verified').default(false),
  created_at: timestamp('created_at').defaultNow(),
});

export const CLASS = mysqlTable('class', {
  id: int('id').notNull().autoincrement().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  institution_id: int('institution_id').references(() => INSTITUTION.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
});

export const DIVISION = mysqlTable('division', {
  id: int('id').notNull().autoincrement().primaryKey(),
  name: varchar('name', { length: 10 }).notNull(),
  class_id: int('class_id').references(() => CLASS.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
});

export const CLASS_MODERATOR = mysqlTable('class_moderator', {
  id: int('id').notNull().autoincrement().primaryKey(),
  class_id: int('class_id').notNull().references(() => CLASS.id, { onDelete: 'cascade' }),
  moderator_id: int('moderator_id').notNull().references(() => MODERATOR.id, { onDelete: 'cascade' }),
  division_id: int('division_id').references(() => DIVISION.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
});
export const COMMUNITY_POST_LIKES = mysqlTable(
  "community_post_likes",
  {
    id: int("id").autoincrement().notNull().primaryKey(),
    post_id: int("post_id")
      .notNull()
      .references(() => COMMUNITY_POST.id, { onDelete: "cascade" }),
    user_id: int("user_id")
      .notNull()
      .references(() => USER_DETAILS.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueLike: uniqueIndex("unique_like_idx", ["post_id", "user_id"]), // Prevent duplicate likes by a user
  })
);

export const COMMUNITY_COMMENTS = mysqlTable("community_post_comments", {
  id: int("id").autoincrement().notNull().primaryKey(),
  post_id: int("post_id")
    .notNull()
    .references(() => COMMUNITY_POST.id, { onDelete: "cascade" }),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const COMMUNITY_POST_POINTS = mysqlTable(
  "community_post_points",
  {
    id: int("id").autoincrement().notNull().primaryKey(),
    post_id: int("post_id")
      .notNull()
      .references(() => COMMUNITY_POST.id, { onDelete: "cascade" }), // Foreign key to the post
    like_points: int("like_points").default(0), // Points from likes
    comment_points: int("comment_points").default(0), // Points from unique comments
    created_at: timestamp("created_at").defaultNow(), // Timestamp for creation
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(), // Timestamp for updates
  },
  (table) => ({
    uniquePost: uniqueIndex("unique_post_idx", ["post_id"]), // Ensure one entry per post
  })
);

// export const CERTIFICATIONS = mysqlTable("certifications", {
//   id: int("id").primaryKey().autoincrement(), // AUTO_INCREMENT primary key
//   certification_name: varchar("certification_name", { length: 255 }).notNull(), // Certification name
//   age: decimal("age", 3, 1).notNull(), // Age with one decimal place
//   // class_name: varchar("class_name", { length: 255 }).notNull(), hav eto add later if needed
//   career_group_id: int("career_group_id")
//     .notNull()
//     .references(() => CAREER_GROUP.id, { onDelete: "cascade" }), // Foreign key referencing career_group table
//   milestone_id: int("milestone_id")
//     .notNull()
//     .references(() => MILESTONES.id), // Foreign key referencing milestones
// });

export const CERTIFICATIONS = mysqlTable("certifications", {
  id: int("id").primaryKey().autoincrement(),
  certification_name: varchar("certification_name", { length: 255 }).notNull(),
  age: decimal("age", 3, 1).notNull(),
  scope_id: int("scope_id").notNull(),
  scope_type: mysqlEnum("scope_type", ["career", "cluster", "sector"]).notNull(),
  milestone_id: int("milestone_id").notNull().references(() => MILESTONES.id),
});


export const CERTIFICATION_QUIZ = mysqlTable("certification_quiz", {
  id: int("id").autoincrement().notNull().primaryKey(),
  question: text("question").notNull(),
  certification_id: int("certification_id")
    .notNull()
    .references(() => CERTIFICATIONS.id),
  age: decimal("age", 3, 1).notNull(),
  class_name: varchar("class_name", { length: 255 }).notNull(),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).notNull().default("beginner"), 
  created_at: timestamp("created_at").defaultNow(),
});

export const CERTIFICATION_QUIZ_OPTIONS = mysqlTable(
  "certification_quiz_options",
  {
    id: int("id").autoincrement().notNull().primaryKey(),
    question_id: int("question_id")
      .notNull()
      .references(() => CERTIFICATION_QUIZ.id),
    option_text: text("option_text").notNull(),
    is_answer: mysqlEnum("is_answer", ["yes", "no"]).notNull(),
    created_at: timestamp("created_at").defaultNow(),
  }
);

export const CERTIFICATION_USER_PROGRESS = mysqlTable(
  "certification_user_progress",
  {
    id: int("id").autoincrement().notNull().primaryKey(),
    user_id: int("user_id")
      .notNull()
      .references(() => USER_DETAILS.id),
    quiz_id: int("quiz_id")
      .notNull()
      .references(() => CERTIFICATION_QUIZ.id),
    certification_id: int("certification_id")
      .notNull()
      .references(() => CERTIFICATIONS.id),
    option_id: int("option_id").notNull(),
    is_answer: mysqlEnum("is_answer", ["yes", "no"]).notNull(),
    created_at: timestamp("created_at").defaultNow(),
  }
);

export const USER_CERTIFICATION_COMPLETION = mysqlTable(
  "user_certification_completion",
  {
    id: int("id").autoincrement().primaryKey(),
    user_id: int("user_id")
      .notNull()
      .references(() => USER_DETAILS.id),
    certification_id: int("certification_id")
      .notNull()
      .references(() => CERTIFICATIONS.id),
      
    certificate_id: varchar("certificate_id", { length: 50 }).unique().notNull(),  // Unique ID for verification
    certification_name: varchar("certification_name", { length: 100 }).notNull(),  // Certification title
    issued_at: timestamp("issued_at").defaultNow(),                                 // Issue date
    status: mysqlEnum("status", ["valid", "invalid"]).default("valid"), 
    level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).notNull().default("beginner"),
    isStarted: boolean("isStarted").notNull().default(false),
    completed: mysqlEnum("completed", ["yes", "no"]).notNull(),
    score_percentage: decimal("score_percentage", 5, 2).default(null),
    rating_stars: int("rating_stars").default(null),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(), // Timestamp for updates
  }
);

// CourseWeeks Table
export const COURSE_WEEKS = mysqlTable("course_weeks", {
  id: int("id").primaryKey().autoincrement(),
  week_number: int("week_number").notNull(),
});

// TopicsCovered Table
export const TOPICS_COVERED = mysqlTable("topics_covered", {
  id: int("id").primaryKey().autoincrement(),
  week_id: int("week_id")
    .default(null)   // Currently there no course we are generatin and if no course no week so for now just givng a default value null
    .references(() => COURSE_WEEKS.id, { onDelete: "cascade" }),
  certification_id: int("certification_id")
    .notNull()
    .references(() => CERTIFICATIONS.id, { onDelete: "cascade" }),
  topic_name: text("topic_name").notNull(),
});

// Assignments Table
export const ASSIGNMENTS = mysqlTable("assignments", {
  id: int("id").primaryKey().autoincrement(),
  week_id: int("week_id")
    .notNull()
    .references(() => COURSE_WEEKS.id, { onDelete: "cascade" }),
  certification_id: int("certification_id")
    .notNull()
    .references(() => CERTIFICATIONS.id, { onDelete: "cascade" }),
  assignment_description: text("assignment_description").notNull(),
});

// LearningOutcomes Table
export const LEARNING_OUTCOMES = mysqlTable("learning_outcomes", {
  id: int("id").primaryKey().autoincrement(),
  week_id: int("week_id")
    .notNull()
    .references(() => COURSE_WEEKS.id, { onDelete: "cascade" }),
  certification_id: int("certification_id")
    .notNull()
    .references(() => CERTIFICATIONS.id, { onDelete: "cascade" }),
  outcome_description: text("outcome_description").notNull(),
});

// CourseOverview Table
export const COURSE_OVERVIEW = mysqlTable("course_overview", {
  id: int("id").primaryKey().autoincrement(),
  certification_id: int("certification_id")
    .notNull()
    .references(() => CERTIFICATIONS.id, { onDelete: "cascade" }),
  prerequisite_description: json("prerequisite_description").notNull(), // Array stored as JSON
  skill_description: json("skill_description").notNull(), // Array stored as JSON
  application_description: json("application_description").notNull(), // Array stored as JSON
});

export const USER_COURSE_PROGRESS = mysqlTable("user_course_progress", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  certification_id: int("certification_id")
    .notNull()
    .references(() => CERTIFICATIONS.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["in_progress", "completed"]).notNull(), // Enum for course status
  enrolled_date: timestamp("enrolled_date").defaultNow(), // timestamp for when the course was enrolled
  completion_date: timestamp("completion_date").defaultNow().onUpdateNow(), // Timestamp for updates
});

export const COMPANIES = mysqlTable("companies", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  description: text("description"),
  password: varchar("password", { length: 255 }).notNull(),
  image: varchar("image", { length: 255 }), // Stores the image URL or path
  isBanned: boolean("isBanned").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const DEPARTMENT = mysqlTable("department", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  company_id: int("company_id").notNull(),
  isBanned: boolean("isBanned").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const COMPANY_MODERATOR = mysqlTable("company_moderator", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  company_id: int("company_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const COMPANY_POSTS = mysqlTable("company_posts", {
  id: int("id").primaryKey().autoincrement(),
  post_type: mysqlEnum("post_type", ["text", "image", "video"]).notNull(),
  caption: varchar("caption", { length: 255 }).notNull(),
  company_id: int("company_id").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const COMPANY_CHALLENGES = mysqlTable("company_challenges", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").default(null),
  show_date: datetime("show_date").notNull(),
  end_date: datetime("end_date").notNull(), // End date and time for the challenge
  challenge_type: mysqlEnum("challenge_type", [
    "upload",
    "quiz",
    "location",
    "pedometer",
  ]).notNull(),
  slug: varchar("slug", { length: 350 }), // UUID for unique challenge identification
  image: varchar("image", { length: 255 }).default(null),
  entry_fee: int("entry_fee").default(0),
  points: int("points").default(0),
  company_id: int("company_id").references(() => COMPANIES.id),
  department_id: int("department_id").references(() => DEPARTMENT.id),
  entry_type: mysqlEnum("entry_type", ["nill", "points", "fee"]).default(
    "nill"
  ),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const COMPANY_CHALLENGE_PROGRESS = mysqlTable(
  "company_challenge_progress",
  {
    id: int("id").primaryKey().autoincrement(),
    challenge_id: int("challenge_id").references(() => COMPANY_CHALLENGES.id),
    user_id: int("user_id").references(() => USER_DETAILS.id),
    company_id: int("company_id").references(() => COMPANIES.id),
    department_id: int("department_id").references(() => DEPARTMENT.id),
    challenge_type: mysqlEnum("challenge_type", [
      "upload",
      "quiz",
      "location",
      "pedometer",
    ]).notNull(),
    image: varchar("image", { length: 255 }).default(null), // Only for 'upload' challenge type
    is_started: boolean("is_started").default(false),
    is_completed: boolean("is_completed").default(false),
    marks: decimal("marks", { precision: 10, scale: 5 }).default(0), // Marks for user progress
    total_points: decimal("total_points", { precision: 10, scale: 5 }).default(
      0
    ), // Total points for the challenge
    submission_status: mysqlEnum("submission_status", [
      "pending",
      "approved",
      "rejected",
    ]).default("pending"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  }
);

export const COMPANY_CHALLENGE_QUESTIONS = mysqlTable(
  "company_challenge_questions",
  {
    id: int("id").primaryKey().autoincrement(),
    challenge_id: int("challenge_id").references(() => COMPANY_CHALLENGES.id),
    question: text("question").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  }
);

export const COMPANY_CHALLENGE_OPTIONS = mysqlTable(
  "company_challenge_options",
  {
    id: int("id").primaryKey().autoincrement(),
    challenge_id: int("challenge_id").references(() => COMPANY_CHALLENGES.id),
    question_id: int("question_id").references(
      () => COMPANY_CHALLENGE_QUESTIONS.id
    ),
    option: varchar("option", { length: 255 }).notNull(),
    is_answer: boolean("is_answer").notNull().default(false), // Indicates if this option is the correct answer
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  }
);

export const COMPANY_CHALLENGE_USER_QUIZ = mysqlTable(
  "company_challenge_user_quiz",
  {
    id: int("id").primaryKey().autoincrement(),
    challenge_id: int("challenge_id").references(() => COMPANY_CHALLENGES.id),
    user_id: int("user_id").references(() => USER_DETAILS.id),
    company_id: int("company_id").references(() => COMPANIES.id),
    question_id: int("question_id").references(
      () => COMPANY_CHALLENGE_QUESTIONS.id
    ),
    option_id: int("option_id").references(() => COMPANY_CHALLENGE_OPTIONS.id),
    marks: decimal("marks", { precision: 10, scale: 5 }).default(0), // Marks for each question answered
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  }
);

export const COMPANY_CHALLENGE_MAPS = mysqlTable("company_challenge_maps", {
  map_id: int("map_id").primaryKey().autoincrement(),
  challenge_id: int("challenge_id")
    .notNull()
    .references(() => COMPANY_CHALLENGES.id), // References COMPANY_CHALLENGES table
  reach_distance: float("reach_distance").notNull(), // Radius in meters
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(), // Latitude
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(), // Longitude
});

export const COMPANY_Challenge_PEDOMETER = mysqlTable(
  "company_challenge_pedometer",
  {
    id: int("id").primaryKey().autoincrement(),
    challenge_id: int("challenge_id")
      .notNull()
      .references(() => COMPANY_CHALLENGES.id), // Foreign key to COMPANY_CHALLENGES table
    steps: float("steps").notNull(), // Number of steps
    direction: varchar("direction", { length: 20 }).default(null), // Direction
  }
);
export const COMPANY_USER_CHALLENGE_POINTS = mysqlTable(
  "company_user_challenge_points",
  {
    id: int("id").primaryKey().autoincrement(),
    user_id: int("user_id").notNull(), // User identifier
    company_id: int("company_id").references(() => COMPANIES.id),
    challenge_id: int("challenge_id").notNull(),
    points: int("points").default(0), // Points earned by the user for a child
    created_at: timestamp("created_at").defaultNow(), // Timestamp for record
  }
);

export const USER_DEPARTMENTS = mysqlTable("user_departments", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  company_id: int("company_id").notNull(),
  department_id: int("department_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const QUIZ_SCORE = mysqlTable("quiz_score", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  challenge_id: int("challenge_id").notNull(), // Link to a specific challenge
  score: decimal("score", { precision: 10, scale: 5 }).notNull(), // Allows 999.99 max
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const USER_POINTS = mysqlTable("user_points", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(), // User identifier
  points: decimal("points", { precision: 10, scale: 5 }).notNull(), // Points earned by the user for a child
  created_at: timestamp("created_at").defaultNow(), // Timestamp for record
});


/* ================================================ */

export const MENTOR_PROFILES = mysqlTable("mentor_profiles", {
  mentor_id: int("mentor_id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  profession: varchar("profession", { length: 100 }),
  experience_years: int("experience_years"),
  bio: text("bio"),
  profile_picture_url: varchar("profile_picture_url", { length: 255 }),
  contact_email: varchar("contact_email", { length: 100 }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const MENTOR_SKILLS = mysqlTable("mentor_skills", {
  skill_id: int("skill_id").autoincrement().primaryKey(),
  mentor_id: int("mentor_id")
    .notNull()
    .references(() => MENTOR_PROFILES.mentor_id, { onDelete: "cascade" }),

  // Skill Details
  skill_name: varchar("skill_name", { length: 100 }).notNull(),
  proficiency_level: mysqlEnum("proficiency_level", ["Beginner", "Intermediate", "Advanced", "Expert"]).notNull(),
  years_of_experience: int("years_of_experience"),
});

export const MENTOR_HIGHLIGHTS = mysqlTable("mentor_highlights", {
  highlight_id: int("highlight_id").autoincrement().primaryKey(),
  mentor_id: int("mentor_id")
    .notNull()
    .references(() => MENTOR_PROFILES.mentor_id, { onDelete: "cascade" }),

  // Highlight Details
  highlight_type: mysqlEnum("highlight_type", ["Achievement", "Certification", "Project", "Success Story"]).notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description"),
  date: date("date"),
});


export const MENTOR_PRICING = mysqlTable("mentor_pricing", {
  id: int("id").autoincrement().primaryKey(),
  mentor_id: int("mentor_id")
    .notNull()
    .references(() => MENTOR_PROFILES.mentor_id, { onDelete: "cascade" }),
  question_price: decimal("question_price", { precision: 10, scale: 2 }).notNull(),
  one_on_one_session_price: decimal("one_on_one_session_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR"),
});

export const MENTOR_AVAILABILITY_SLOTS = mysqlTable("mentor_availability_slots", {
  slot_id: int("slot_id").autoincrement().primaryKey(),
  mentor_id: int("mentor_id")
    .notNull()
    .references(() => MENTOR_PROFILES.mentor_id, { onDelete: "cascade" }),
    day_of_week: int("day_of_week").notNull(),
  start_time: time("start_time").notNull(),
  end_time: time("end_time").notNull(),
  slot_duration_minutes: int("slot_duration_minutes").default(60),
  // is_recurring: boolean("is_recurring").default(true),
  is_active: boolean("is_active").default(true),
  is_booked: boolean("is_booked").default(false),
  booked_by_user_id: int("booked_by_user_id"),
  booking_timestamp: timestamp("booking_timestamp"),
});

export const USER_MENTOR_RELATIONSHIPS = mysqlTable("user_mentor_relationships", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  mentor_id: int("mentor_id")
    .notNull()
    .references(() => MENTOR_PROFILES.mentor_id, { onDelete: "cascade" }),
  relationship_type: mysqlEnum("relationship_type", ["followed", "added"]).notNull(),
  career_group_id: int("career_group_id")
    .references(() => CAREER_GROUP.id, { onDelete: "set null" }),
  added_at: timestamp("added_at").defaultNow(),
});

export const ONE_ON_ONE_SESSIONS = mysqlTable("one_on_one_sessions", {
  session_id: int("session_id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  mentor_id: int("mentor_id")
    .notNull()
    .references(() => MENTOR_PROFILES.mentor_id, { onDelete: "cascade" }),
  career_group_id: int("career_group_id")
    .references(() => CAREER_GROUP.id, { onDelete: "set null" }),
  availability_slot_id: int("availability_slot_id")
    .notNull()
    .references(() => MENTOR_AVAILABILITY_SLOTS.slot_id, { onDelete: "cascade" }),
  session_status: mysqlEnum("session_status", ["scheduled", "in_progress", "completed", "cancelled"]).notNull(),
  start_time: timestamp("start_time"),
  end_time: timestamp("end_time"),
  total_price: decimal("total_price", { precision: 10, scale: 2 }),
  payment_status: mysqlEnum("payment_status", ["pending", "paid", "refunded"]).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const ONE_ON_ONE_CHAT_MESSAGES = mysqlTable("one_on_one_chat_messages", {
  message_id: int("message_id").autoincrement().primaryKey(),
  session_id: int("session_id")
    .notNull()
    .references(() => ONE_ON_ONE_SESSIONS.session_id, { onDelete: "cascade" }),
  sender_type: mysqlEnum("sender_type", ["user", "mentor"]).notNull(),
  sender_id: int("sender_id").notNull(),
  message_text: text("message_text").notNull(),
  sent_at: timestamp("sent_at").defaultNow(),
  is_read: boolean("is_read").default(false),
});

export const QUESTION_SESSIONS = mysqlTable("question_sessions", {
  question_session_id: int("question_session_id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  mentor_id: int("mentor_id")
    .notNull()
    .references(() => MENTOR_PROFILES.mentor_id, { onDelete: "cascade" }),
  career_group_id: int("career_group_id")
    .references(() => CAREER_GROUP.id, { onDelete: "set null" }),
  session_status: mysqlEnum("session_status", ["active", "completed"]).notNull(),
  total_price: decimal("total_price", { precision: 10, scale: 2 }),
  payment_status: mysqlEnum("payment_status", ["pending", "paid"]).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  last_interaction_at: timestamp("last_interaction_at").defaultNow(),
});

// export const QUESTION_SESSION_MESSAGES = mysqlTable("question_session_messages", {
//   message_id: int("message_id").autoincrement().primaryKey(),
//   question_session_id: int("question_session_id")
//     .notNull()
//     .references(() => QUESTION_SESSIONS.question_session_id, { onDelete: "cascade" }),
//   sender_type: mysqlEnum("sender_type", ["user", "mentor"]).notNull(),
//   sender_id: int("sender_id").notNull(),
//   message_text: text("message_text").notNull(),
//   message_type: mysqlEnum("message_type", ["question", "answer"]).notNull(),
//   sent_at: timestamp("sent_at").defaultNow(),
//   is_read: boolean("is_read").default(false),
//   character_limit: int("character_limit").default(500),
// });

export const SESSION_QUESTIONS = mysqlTable("session_questions", {
  question_id: int("question_id").autoincrement().primaryKey(),
  question_session_id: int("question_session_id")
    .notNull()
    .references(() => QUESTION_SESSIONS.question_session_id, { onDelete: "cascade" }),
  user_id: int("user_id").notNull().references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  question_text: text("question_text").notNull(),
  created_at: timestamp("created_at").defaultNow()
});

export const SESSION_ANSWERS = mysqlTable("session_answers", {
  answer_id: int("answer_id").autoincrement().primaryKey(),
  question_id: int("question_id")
    .notNull()
    .references(() => SESSION_QUESTIONS.question_id, { onDelete: "cascade" }),
  mentor_id: int("mentor_id").notNull().references(() => MENTOR_PROFILES.mentor_id, { onDelete: "cascade" }),
  answer_text: text("answer_text").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  is_read: boolean("is_read").default(false)
});

export const USER_DAILY_QUESTION_LIMIT = mysqlTable("user_daily_question_limit", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  mentor_id: int("mentor_id")
    .notNull()
    .references(() => MENTOR_PROFILES.mentor_id, { onDelete: "cascade" }),
  question_count: int("question_count").default(0),
  last_reset_date: timestamp("last_reset_date").defaultNow(),
});

/* ------------------------- */

export const MBTI_SECTOR_MAP = mysqlTable("mbti_sector_map", {
  id: int("id").notNull().autoincrement().primaryKey(),
  mbti_type: varchar("mbti_type", { length: 10 }).notNull(),
  sector_1_id: int("sector_1_id").notNull().references(() => SECTOR.id),
  sector_2_id: int("sector_2_id").notNull().references(() => SECTOR.id),
  sector_3_id: int("sector_3_id").notNull().references(() => SECTOR.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const SECTOR = mysqlTable("sector", {
  id: int("id").notNull().autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").default(null),
  created_at: timestamp("created_at").defaultNow(),
});

export const CLUSTER = mysqlTable("cluster", {
  id: int("id").notNull().autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").default(null),
  related_jobs: text("related_jobs").default(null),
  created_at: timestamp("created_at").defaultNow(),
});

export const USER_SECTOR = mysqlTable("user_sector", {
  id: int("id").notNull().autoincrement().primaryKey(),
  user_id: int("user_id").notNull().references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  sector_id: int("sector_id").notNull().references(() => SECTOR.id),
  mbti_type: varchar("mbti_type", { length: 10 }).default(null),
  created_at: timestamp("created_at").defaultNow(),
});

export const USER_CLUSTER = mysqlTable("user_cluster", {
  id: int("id").notNull().autoincrement().primaryKey(),
  user_id: int("user_id").notNull().references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  cluster_id: int("cluster_id").notNull().references(() => CLUSTER.id),
  mbti_type: varchar("mbti_type", { length: 10 }).default(null),
  riasec_code: varchar("riasec_code", { length: 10 }).default(null),
  selected: boolean("selected").notNull().default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const CONTENT_SCOPE = mysqlTable("content_scope", { 
  id: int("id").notNull().autoincrement().primaryKey(),
  user_id: int("user_id").notNull().references(() => USER_DETAILS.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["career", "cluster", "sector"]).notNull(), // Identifies what it is
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});