import { boolean, date, datetime, decimal, float, int, mysqlEnum, mysqlTable, primaryKey, text, time, timestamp, varchar } from "drizzle-orm/mysql-core";

export const USER_DETAILS= mysqlTable('user_details',{
    id:int('id').autoincrement().notNull().primaryKey(),
    name:varchar('name',{length:150}).notNull(),
    gender:varchar('gender',{length:150}).default(null),
    mobile:varchar('mobile',{length:100}).default(null),
    birth_date:date('birth_date').default(null),
    password:varchar('password',{length:150}).default(null),
    username:varchar('username',{length:150}).default(null),
    education:varchar('education',{length:200}).default(`Bachelor's Degree`),
    student:mysqlEnum('student',['yes','no']).notNull(),
    college:text('college').default(null),
    university:text('university').default(null),
    yearOfPassing:varchar('yearOfPassing',{length:150}).default(null),
    monthOfPassing:varchar('monthOfPassing',{length:150}).default(null),
    country:varchar('country',{length:30}).default(null)
});

// Define the schema for the 'page' table
export const PAGE = mysqlTable('page', {
    id: int('id').primaryKey().notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description').notNull(),
    start_date: datetime('start_date').notNull(),
    end_date: datetime('end_date').notNull(),
    icon: varchar('icon', { length: 150 }).notNull(),
    banner: varchar('banner', { length: 150 }).notNull(),
    active: mysqlEnum('active', ['yes', 'no']).notNull(),
    followers: int('followers').default(0).notNull(),
    type: varchar('type', { length: 150 }).notNull(),
    password: varchar('password', { length: 150 }).notNull(),
    super_admin: mysqlEnum('super_admin', ['no', 'yes']).notNull(),
    email: varchar('email', { length: 150 }).notNull(),
    slug: varchar('slug', { length: 300 }).notNull(),
});

export const QUESTIONS = mysqlTable('questions', {
    id: int('id').primaryKey().autoincrement(),
    type: mysqlEnum('type', ['text', 'audio', 'video', 'image']).notNull(),
    timer: int('timer').notNull(),
    video: varchar('video', { length: 150 }),
    audio: varchar('audio', { length: 150 }),
    image: varchar('image', { length: 150 }),
    question: text('question').notNull(),
    challenge_id: int('challenge_id').notNull(),
    task_id: int('task_id').notNull(),
    option: mysqlEnum('option', ['normal', 'poison', 'bonus']).notNull(),
    stars: int('stars').notNull().default(0),
    quiz_type: mysqlEnum('quiz_type', ['least', 'most']).notNull(),
});

export const ANSWERS = mysqlTable('answers', {
    id: int('id').primaryKey().autoincrement(),
    question_id: int('question_id').notNull(),
    answer_text: text('answer_text').notNull(),
    answer: mysqlEnum('answer', ['no', 'yes']).notNull(),
    task_marks: decimal('task_marks', { precision: 10, scale: 2 }),
});

export const TASKS = mysqlTable('tasks', {
    task_id: int('task_id').primaryKey().autoincrement(),
    challenge_id: int('challenge_id').notNull(),
    task_name: varchar('task_name', { length: 100 }).notNull(),
    description: text('description').notNull(),
    start_date: datetime('start_date').notNull(),
    start_time: time('start_time').notNull(),
    end_date: datetime('end_date').notNull(),
    end_time: time('end_time').notNull(),
    task_type: varchar('task_type', { length: 100 }).notNull(),
    verification_method: varchar('verification_method', { length: 15 }).notNull(),
    entry_points: int('entry_points',{maxValue:100,minValue:1}).notNull(),
    reward_points: int('reward_points',{maxValue:100,minValue:1}).notNull(),
    reward_cash: int('reward_cash',{maxValue:100,minValue:1}).notNull(),
    verification_points: int('verification_points',{maxValue:100,minValue:1}).notNull(),
    is_certificate: varchar('is_certificate', { length: 15 }).notNull(),
    is_badge: varchar('is_badge', { length: 15 }).notNull(),
    player_level: varchar('player_level', { length: 15 }).notNull(),
    created_date: datetime('created_date').notNull(),
    created_by: varchar('created_by', { length: 100 }).notNull(),
    participants_count: int('participants_count').notNull(),
    active: mysqlEnum('active', ['yes', 'no']).notNull(),
    removed_date: datetime('removed_date'),
    removed_by: varchar('removed_by', { length: 100 }),
    day: int('day').notNull().default(0),
    win_mark: int('win_mark').notNull(),
    quiz_type: mysqlEnum('quiz_type', ['normal', 'psychological']).notNull(),
    task_percent: int('task_percent',{maxValue:100,minValue:1}).notNull().default(0),
    task_variety: mysqlEnum('task_variety', ['technical', 'aptitude']).notNull(),
    live: mysqlEnum('live', ['yes', 'no']).notNull(),
    rank: int('rank').notNull().default(10),
});


// Define the schema for the 'challenges' table
// export const CHALLENGES = mysqlTable('challenges', {
//     challenge_id: int('challenge_id').primaryKey().autoincrement(),
//     page_id: int('page_id').notNull(),
//     career_group_id: int('career_group_id').references(() => CAREER_GROUP.id),
//     title: varchar('title', { length: 100 }).notNull(),
//     description: text('description').notNull(),
//     challenge_type: mysqlEnum('challenge_type', ['ordered', 'unordered']).notNull(),
//     frequency: mysqlEnum('frequency', [
//         'challenges', 'daily', 'bootcamp', 'contest', 'treasure', 'referral', 
//         'streak', 'refer', 'quiz', 'food', 'experience'
//     ]).notNull(),
//     start_date: datetime('start_date').notNull(),
//     start_time: time('start_time').notNull(),
//     end_date: datetime('end_date').notNull(),
//     end_time: time('end_time').notNull(),
//     entry_points: int('entry_points').notNull(),
//     reward_points: int('reward_points').notNull(),
//     level: int('level').default(1).notNull(),
//     created_by: varchar('created_by', { length: 100 }).notNull(),
//     created_date: datetime('created_date').notNull(),
//     participants_count: int('participants_count').default(0).notNull(),
//     removed_date: datetime('removed_date'),
//     removed_by: varchar('removed_by', { length: 100 }),
//     arena: mysqlEnum('arena', ['no', 'yes']).notNull(),
//     district_id: int('district_id'),
//     visit: mysqlEnum('visit', ['no', 'yes']).notNull(),
//     active: mysqlEnum('active', ['no', 'yes']).notNull(),
//     days: int('days').default(0).notNull(),
//     referral_count: int('referral_count').default(0).notNull(),
//     open_for: mysqlEnum('open_for', ['everyone', 'location', 'specific']).notNull(),
//     like_based: mysqlEnum('like_based', ['no', 'yes']).notNull(),
//     live: mysqlEnum('live', ['no', 'yes']).notNull(),
//     questions: int('questions').default(0).notNull(),
//     exp_type: mysqlEnum('exp_type', ['biriyani', 'arts', 'breakfast', 'entertainment']).notNull(),
//     rewards: mysqlEnum('rewards', ['no', 'yes']).notNull(),
//     dep_id: int('dep_id').notNull(),
//     page_type: mysqlEnum('page_type', ['job','internship','tests','language','compatibility']).notNull(),
//     rounds: int('rounds').notNull(),
//     start_datetime: datetime('start_datetime').default(new Date()).notNull(),
//     language_id: int('language_id').notNull(),
// });

export const ANALYTICS_QUESTION = mysqlTable('analytics_question', {
    id: int('id').primaryKey().autoincrement(),
    question_text: varchar('question_text', { length: 300 }).notNull(),
    quiz_id: int('quiz_id').notNull(),
});

export const OPTIONS = mysqlTable('options', {
    id: int('id').primaryKey().autoincrement(),
    option_text: varchar('option_text', { length: 300 }).notNull(),
    analytic_id: int('analytic_id').notNull(),
    question_id: int('question_id').notNull(),
});
export const OPTIONS_KIDS = mysqlTable('options_kids', {
    id: int('id').primaryKey().autoincrement(),
    option_text: varchar('option_text', { length: 300 }).notNull(),
    analytic_id: int('analytic_id').notNull(),
    question_id: int('question_id').notNull(),
});

export const USER_PROGRESS = mysqlTable('user_progress', {
    id: int('id').primaryKey().autoincrement(),
    user_id: int('user_id').notNull(),
    question_id: int('question_id').notNull(),
    option_id: int('option_id').notNull(),
    analytic_id: int('analytic_id').notNull(),
    created_at: datetime('created_at').notNull(),
});

export const USER_CAREER_PROGRESS = mysqlTable('user_career_progress', {
    id: int('id').primaryKey().autoincrement(),
    user_id: int('user_id').notNull(),
    question_id: int('question_id').notNull(),
    option_id: int('option_id').notNull(),
    personality_type_id: int('personality_type_id').notNull(),
    created_at: datetime('created_at').notNull(),
});

export const RESULTS1=mysqlTable('result1',{
    id:int('id').primaryKey().notNull(),
    type_sequence:varchar('type_sequence',{length:4}).notNull(),
    description:text('description').default(null),
    strengths:text('strengths').default(null),
    weaknesses:text('weaknesses').default(null),
    opportunities:text('opportunities').default(null),
    threats:text('threats').default(null),
    most_suitable_careers:text('most_suitable_careers').default(null),
    least_suitable_careers:text('least_suitable_careers').default(null)
});
export const QUIZZES = mysqlTable('quizzes', {
    id: int('id').primaryKey().autoincrement(),
    title: varchar('title', { length: 300 }).notNull(),
    description: text('description').notNull(),
});

export const PERSONALITY_TYPES = mysqlTable('personality_types', {
    id: int('id').primaryKey().autoincrement(),
    type_code: varchar('type_code', { length: 10 }).notNull(),
    type_name: varchar('type_name', { length: 50 }).notNull(),
});

export const PERSONALITY_QUESTIONS = mysqlTable('personality_questions', {
    id: int('id').primaryKey().autoincrement(),
    question_text: text('question_text').notNull(),
    quiz_id: int('quiz_id').notNull().references(() => QUIZZES.id),
    personality_types_id: int('personality_types_id').notNull().references(() => PERSONALITY_TYPES.id),
});
export const PERSONALITY_QUESTIONS_KIDS = mysqlTable('personality_questions_kids', {
    id: int('id').primaryKey().autoincrement(),
    question_text: text('question_text').notNull(),
    quiz_id: int('quiz_id').notNull().references(() => QUIZZES.id),
    personality_types_id: int('personality_types_id').notNull().references(() => PERSONALITY_TYPES.id),
});

export const PERSONALITY_CHOICES = mysqlTable('personality_choices', {
    id: int('id').primaryKey().autoincrement(),
    choice_text: varchar('choice_text', { length: 50 }).notNull(),
});

export const QUIZ_SEQUENCES = mysqlTable('quiz_sequences', {
    id: int('id').primaryKey().autoincrement(),
    type_sequence: text('type_sequence').notNull().default(''),
    user_id: int('user_id').notNull(),
    quiz_id: int('quiz_id').notNull(), // New column for quiz identification
    createddate: datetime('createddate').notNull(),
    isCompleted: boolean('isCompleted').notNull().default(false), // New boolean column
    isStarted: boolean('isStarted').notNull().default(false),     // New boolean column
});

export const FEEDBACK=mysqlTable('feedback',{
    user_id:int('user_id').primaryKey().references(()=>USER_DETAILS.id).notNull(),
    rating:int('rating').notNull(),
    description:text('description').default(null)
})

export const USER_CAREER = mysqlTable('user_career', {
    id: int('id').notNull().autoincrement().primaryKey(),
    user_id: int('user_id').notNull(),
    career_group_id: int('career_group_id').notNull().references(() => CAREER_GROUP.id),
    reason_for_recommendation: text('reason_for_recommendation').default(null),
    present_trends: text('present_trends').default(null),
    future_prospects: text('future_prospects').default(null),
    user_description: text('user_description').default(null),
    created_at: timestamp('created_at').defaultNow(),
    type2: varchar('type2', { length: 255 }).notNull(),
    type1: varchar('type1', { length: 255 }).notNull(),
    country: text('country').default(null),
    feedback: text('feedback').default(null),
  });

export const USER_CAREER_STATUS = mysqlTable('user_career_status', {
    id: int('id').autoincrement().notNull().primaryKey(),
    user_career_id: varchar('user_career_id', { length: 36 }).notNull().references(() => USER_CAREER.id),
    roadmap_status: mysqlEnum('roadmap_status', ['not_started', 'in_progress', 'completed'])
        .default('not_started')
        .notNull(),
    created_at: timestamp('created_at').defaultNow(), // Automatically set to current timestamp when created
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow() // Automatically updated to current timestamp on update
});

export const STRENGTH_TYPES = mysqlTable('strength_types', {
    id: int('id').primaryKey().autoincrement(),
    type_code: varchar('type_code', { length: 10 }).notNull(),
    type_name: varchar('type_name', { length: 50 }).notNull(),
});

export const STRENGTH_QUESTIONS = mysqlTable('strength_questions', {
    id: int('id').primaryKey().autoincrement(),
    question_text: text('question_text').notNull(),
    quiz_id: int('quiz_id').notNull().references(() => QUIZZES.id),
    strength_types_id: int('strength_types_id').notNull().references(() => STRENGTH_TYPES.id),
});

export const STRENGTH_CHOICES = mysqlTable('strength_choices', {
    id: int('id').primaryKey().autoincrement(),
    choice_text: varchar('choice_text', { length: 50 }).notNull(),
});

export const STRENGTH_QUIZ_PROGRESS = mysqlTable('strength_quiz_progress', {
    id: int('id').primaryKey().autoincrement(),
    user_id: int('user_id').notNull(),
    question_id: int('question_id').notNull(),
    option_id: int('option_id').notNull(),
    strength_type_id: int('strength_type_id').notNull(),
    created_at: datetime('created_at').notNull(),
});

export const USER_RESULTS=mysqlTable('user_results',{
    id: int('id').primaryKey().autoincrement(),
    user_id:int('user_id').primaryKey().references(()=>USER_DETAILS.id).notNull(),
    result2:text('result2').default(null),
    quiz_id:int('quiz_id'),
    type: mysqlEnum('type', ['basic', 'advance']).default('basic'),
    country: varchar('country', 255).default(null),
})

export const ANALYTICS_QUESTION_KIDS = mysqlTable('analytics_question_kids', {
    id: int('id').primaryKey().autoincrement(),
    question_text: varchar('question_text', { length: 300 }).notNull(),
    quiz_id: int('quiz_id').notNull(),
});

export const CAREER_GROUP = mysqlTable('career_group', {
    id: int('id').notNull().autoincrement().primaryKey(),
    career_name: varchar('career_name', { length: 255 }).notNull().unique(),
    created_at: timestamp('created_at').defaultNow(),
  });

// Define the `user_progress` table schema
export const QUIZ_PROGRESS = mysqlTable('quiz_progress', {
    id: int('id').primaryKey().autoincrement(),  // AUTO_INCREMENT primary key
    question_id: int('question_id').notNull(),  // Foreign key to questions table
    answer_id: int('answer_id').notNull(),  // Foreign key to answers table
    user_id: int('user_id').notNull(),  // Foreign key to users table
    marks: decimal('marks', 10, 3).notNull(),  // Decimal column with precision (10, 3)
    created_at: timestamp('created_at').defaultNow(),  // Creation timestamp with default current timestamp
    challenge_id: int('challenge_id').notNull(),  // Foreign key to challenge table
    task_id: int('task_id').notNull()  // Foreign key to tasks table
  });

  export const USER_TASKS = mysqlTable('user_tasks', {
    id: int('id').primaryKey().autoincrement(),
    task_id: int('task_id').notNull(),
    user_id: int('user_id').notNull(),
    reward_points: int('reward_points').default(0),
    approved: mysqlEnum('approved', ['nill', 'yes', 'no']).notNull(),
    entry_points: int('entry_points').default(0).notNull(),
    rejected: mysqlEnum('rejected', ['no', 'yes']).notNull(),
    start_date: datetime('start_date').default(new Date()).notNull(),
    start_time: time('start_time').default(null),
    end_date: datetime('end_date').default(null),
    end_time: time('end_time').default(null),
    steps: int('steps').default(0),
    approved_by: varchar('approved_by', { length: 100 }).default(null),
    completed: mysqlEnum('completed', ['no', 'yes']).notNull(),
    arena: mysqlEnum('arena', ['no', 'yes']).notNull(),
    challenge_id: int('challenge_id').notNull(),
    image: varchar('image', { length: 150 }).default(null),
    video: varchar('video', { length: 150 }).default(null),
    day: int('day').default(0).notNull(),
    started: mysqlEnum('started', ['no', 'yes']).notNull(),
  });

  export const TEMP_LEADER = mysqlTable('temp_leader', {
    id: int('id').primaryKey().autoincrement(),
    marks: decimal('marks', 10, 3).notNull(),
    userId: int('user_id').notNull(),
    challengeId: int('challenge_id').notNull(),
    taskId: int('task_id').notNull(),
  });


    export const SUBJECTS = mysqlTable('subjects', {
        subject_id: int('subject_id').primaryKey().autoincrement(),
        subject_name: varchar('subject_name', { length: 255 }).notNull().unique(),
        min_age: int('min_age').notNull(),
        max_age: int('max_age').notNull(),
    });

    export const CAREER_SUBJECTS = mysqlTable('career_subjects', {
        career_id: int('career_id')
            .notNull()
            .references(() => CAREER_GROUP.id, /* { onDelete: 'cascade' } */),  // Reference to CAREER_GROUP now
        subject_id: int('subject_id')
            .notNull()
            .references(() => SUBJECTS.subject_id, /* { onDelete: 'cascade' } */),  // Foreign key to Subjects table
    }, (table) => {
        return {
            pk: primaryKey(table.career_id, table.subject_id),  // Composite primary key
        };
    });

    export const TESTS = mysqlTable('tests', {
        test_id: int('test_id').autoincrement().primaryKey(),
        subject_id: int('subject_id').notNull().references(() => SUBJECTS.subject_id),
        test_date: date('test_date').notNull(),
        age_group: int('age_group').notNull(),
    });

    export const USER_TESTS = mysqlTable('user_tests', {
        user_test_id: int('user_test_id').autoincrement().primaryKey(),
        user_id: int('user_id').notNull().references(() => USER_DETAILS.id),
        test_id: int('test_id').notNull().references(() => TESTS.test_id),
        score: int('score').default(null),
        stars_awarded: int('stars_awarded').default(null),
        completed: mysqlEnum('completed', ['no', 'yes']).notNull(),
    });
    
    export const STAR_CRITERIA = mysqlTable('star_criteria', {
        criteria_id: int('criteria_id').autoincrement().primaryKey(),
        test_id: int('test_id').notNull().references(() => TESTS.test_id),
        min_score: int('min_score').notNull(),
        stars: int('stars').notNull(),
    });
    
    export const TEST_QUESTIONS = mysqlTable('test_questions', {
        id: int('id').primaryKey().autoincrement(),
        timer: int('timer').notNull(),
        question: text('question').notNull(),
        test_id: int('test_id').notNull().references(() => TESTS.test_id),
    });
    
    export const TEST_ANSWERS = mysqlTable('test_answers', {
        id: int('id').primaryKey().autoincrement(),
        test_questionId: int('test_questionId').notNull().references(() => TEST_QUESTIONS.id),
        test_id: int('test_id').notNull().references(() => TESTS.test_id),
        answer_text: text('answer_text').notNull(),
        answer: mysqlEnum('answer', ['no', 'yes']).notNull(),
        test_marks: decimal('task_marks', { precision: 10, scale: 2 }),
    });

    // Define the `user_progress` table schema
    export const TEST_PROGRESS = mysqlTable('test_progress', {
        id: int('id').primaryKey().autoincrement(), 
        test_questionId: int('question_id').notNull().references(() => TEST_QUESTIONS.id),
        test_answerId: int('answer_id'),
        user_id: int('user_id').notNull().references(() => USER_DETAILS.id), 
        created_at: timestamp('created_at').defaultNow(),
        test_id: int('test_id').notNull().references(() => TESTS.test_id),
    });

    export const ACTIVITIES = mysqlTable('activities', {
        id:int('id').notNull().primaryKey().autoincrement(),
        activity_id: int('activity_id').notNull(),
        user_id: int('user_id').notNull().references(() => USER_DETAILS.id),  
        career_id: int('career_id').notNull().references(() => CAREER_GROUP.id),  
        step: int('step').notNull(),
        activity_text: text('activity_text').notNull(),
        created_at: timestamp('created_at').defaultNow(),
      });

      export const USER_ACTIVITIES = mysqlTable('user_activities', {
        id:int('id').notNull().primaryKey().autoincrement(),
        user_id: int('user_id').notNull(),  
        activity_id: int('activity_id').notNull(), 
        status: mysqlEnum('status', ['active', 'completed', 'skipped']).notNull(),
        updated_at: timestamp('updated_at').defaultNow(),
      });
      export const SCHOOL = mysqlTable('school', {
        id: int('id').notNull().primaryKey().autoincrement(),
        title: varchar('title', 255).notNull(),
        image: varchar('image', 255),
        bgImg: varchar('bgImg', 255),
      });

      export const CHALLENGES = mysqlTable('challenges', {
        id: int('id').notNull().primaryKey().autoincrement(), 
        age: int('age').notNull(),                            
        country: varchar('country', 255).notNull(),           
        career_id: int('career_id').notNull(),                
        week: int('week').notNull(),                          
        created_at: timestamp('created_at').defaultNow().notNull(), 
        challenge: varchar('challenge', 255).notNull(),       
        verification: varchar('verification', 255).notNull(), 
      });
      export const Moderator = mysqlTable('Moderator', {
        id: int('id').notNull().primaryKey().autoincrement(),   
        school_id: int('school_id').notNull().references(() => SCHOOL.id),
        title: varchar('title', 255).notNull(),                 
        name: varchar('name', 255).notNull(),                   
      });

      export const CHALLENGE_PROGRESS = mysqlTable('challenge_progress', {
        id: int('id').notNull().primaryKey().autoincrement(),
        user_id: int('user_id').notNull().references(() => USER_DETAILS.id),
        challenge_id:int('challenge_id').notNull().references(()=>CHALLENGES.id),
        image: varchar('image', 255).notNull(),
        status: mysqlEnum('status', ['pending', 'approved', 'rejected']).notNull(),
        created_at: timestamp('created_at').defaultNow(),
        age: int('age').notNull(),
        school_id: int('school_id').notNull(),
        week: int('week').notNull()
      });
      export const MILESTONE_CATEGORIES = mysqlTable('milestone_categories', {
        id: int('id').notNull().autoincrement().primaryKey(),
        name: varchar('name', { length: 255 }).notNull().unique(),
      });

    export const MILESTONES = mysqlTable('milestones', {
        id: int('id').notNull().autoincrement().primaryKey(),
        category_id: int('category_id').notNull().references(() => MILESTONE_CATEGORIES.id),
        description: text('description').default(null),
        completion_status: boolean('completion_status').default(false),
        date_achieved: timestamp('date_achieved').default(null),
        milestone_age: decimal('milestone_age', { precision: 3, scale: 1 }).default(null),
    });

    export const USER_MILESTONES = mysqlTable('user_milestones', {
        id: int('id').notNull().autoincrement().primaryKey(),
        user_career_id: int('user_career_id').notNull().references(() => USER_CAREER.id),
        milestone_id: int('milestone_id').notNull().references(() => MILESTONES.id),
    });