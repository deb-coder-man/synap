// ─── Enums ────────────────────────────────────────────────────────────────────

export type Priority = "LOW" | "MEDIUM" | "HIGH";

// ─── Shared application types ─────────────────────────────────────────────────
// These mirror the Prisma schema so client code stays type-safe without
// importing from the generated Prisma client directly.

export type List = {
  id: string;
  name: string;
  colour: string;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  estimatedHours: number | null;
  dueDate: string | null;
  order: number;
  priority: Priority;
  urgent: boolean;
  important: boolean;
  completed: boolean;
  completedAt: string | null;
  archived: boolean;
  listId: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserSettings = {
  id: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  pomodoroFocusDuration: number;
  pomodoroShortBreak: number;
  pomodoroLongBreak: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Input types (what the API expects on create / update) ────────────────────

export type CreateListInput = Pick<List, "name" | "colour"> & { order?: number };
export type UpdateListInput = Partial<Pick<List, "name" | "colour" | "order">> & { archiveAllTasks?: boolean };

export type CreateTaskInput = Pick<Task, "title" | "listId"> &
  Partial<Pick<Task, "description" | "estimatedHours" | "dueDate" | "priority" | "urgent" | "important" | "order">>;
export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "estimatedHours" | "dueDate" | "priority" | "urgent" | "important" | "order" | "completed" | "completedAt" | "archived" | "listId">
>;

export type UpdateSettingsInput = Partial<
  Pick<UserSettings, "backgroundColor" | "textColor" | "fontFamily" | "pomodoroFocusDuration" | "pomodoroShortBreak" | "pomodoroLongBreak">
>;

export type UpdateUserInput = Partial<
  Pick<UserProfile, "firstName" | "lastName" | "username" | "image">
>;
