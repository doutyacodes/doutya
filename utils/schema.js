import { int, mysqlTable, time, varchar, datetime, float, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { date } from "drizzle-orm/pg-core";

export const USER_DETAILS= mysqlTable('user_details',{
    id:int('id').autoincrement().notNull().primaryKey(),
    name:varchar('name',{length:150}).notNull(),
    gender:varchar('gender',{length:150}).default(null),
    mobile:varchar('mobile',{length:100}).default(null),
    birth_date:date('birth_date').default(null),
    password:varchar('password',{length:150}).default(null),
    username:varchar('username',{length:150}).default(null),
    education:varchar('education',{length:200}).default(null),
    student:mysqlEnum('student',['yes','no']).notNull(),
    college:text('college').default(null),
    university:text('university').default(null),
    yearOfPassing:varchar('yearOfPassing',{length:150}).default(null),
    monthOfPassing:varchar('monthOfPassing',{length:150}).default(null)
});