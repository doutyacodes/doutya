import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  datetime,
  decimal,
  float,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { INSTITUTION } from "../schema";

export const INSTITUTION_STREAMS = mysqlTable("institution_streams", {
  id: int("id").notNull().autoincrement().primaryKey(),
  institution_id: int("institution_id").notNull().references(() => INSTITUTION.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").default(null),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const INSTITUTION_STREAM_SUBJECTS = mysqlTable("institution_stream_subjects", {
  id: int("id").notNull().autoincrement().primaryKey(),
  stream_id: int("stream_id").notNull().references(() => INSTITUTION_STREAMS.id, { onDelete: "cascade" }),
  subject_name: varchar("subject_name", { length: 100 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const INSTITUTION_COURSES = mysqlTable("institution_courses", {
  id: int("id").notNull().autoincrement().primaryKey(),
  institution_id: int("institution_id").notNull().references(() => INSTITUTION.id, { onDelete: "cascade" }),
  course_name: varchar("course_name", { length: 150 }).notNull(),
  description: text("description").default(null),
  duration_years: int("duration_years").default(null),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const INSTITUTION_COURSE_SUBJECTS = mysqlTable("institution_course_subjects", {
  id: int("id").notNull().autoincrement().primaryKey(),
  course_id: int("course_id").notNull().references(() => INSTITUTION_COURSES.id, { onDelete: "cascade" }),
  subject_name: varchar("subject_name", { length: 100 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// ==================================================

  export const INSTITUTION_COMMUNITY = mysqlTable('institution_community', {
      id: int('id').notNull().autoincrement().primaryKey(),
      name: varchar('name', 255), // Name of the community
      institution_id: int('institution_id')
          .notNull()
          .unique()
          .references(() => INSTITUTION.id, { onDelete: 'cascade' }), // Each institution has one community
      created_at: timestamp('created_at').defaultNow(),
  });

  export const INSTITUTION_COMMUNITY_POSTS = mysqlTable('institution_community_posts', {
    id: int('id').notNull().autoincrement().primaryKey(),
    community_id: int('community_id')
        .notNull()
        .references(() => INSTITUTION_COMMUNITY.id, { onDelete: 'cascade' }),
    posted_by_type: mysqlEnum('posted_by_type', ['SchoolAdmin', 'Admin', 'ClassAdmin', 'Student']).notNull(),
    posted_by_id: int('posted_by_id').notNull(), // ID of the user, moderator, or school admin
    file_url: varchar('file_url', { length: 255 }).default(null), // Field to store file path or filename
    caption: text('caption').default(null), // Caption can be null
    type: mysqlEnum('type', ['Video', 'Image', 'Text']).notNull(), // Changed to ENUM for consistency
    text_content: text('text_content').default(null), // Text content for text posts, allows null
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').onUpdateNow(),
  });
    