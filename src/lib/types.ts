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
  urgent: boolean;
  important: boolean;
  completed: boolean;
  completedAt: string | null;
  archived: boolean;
  listId: string;
  createdAt: string;
  updatedAt: string;
};

export type UserSettings = {
  id: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Input types (what the API expects on create / update) ────────────────────

export type CreateListInput = Pick<List, "name" | "colour"> & { order?: number };
export type UpdateListInput = Partial<Pick<List, "name" | "colour" | "order">>;

export type CreateTaskInput = Pick<Task, "title" | "listId"> &
  Partial<Pick<Task, "description" | "estimatedHours" | "dueDate" | "urgent" | "important" | "order">>;
export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "estimatedHours" | "dueDate" | "urgent" | "important" | "order" | "completed" | "archived">
>;

export type UpdateSettingsInput = Partial<
  Pick<UserSettings, "backgroundColor" | "textColor" | "fontFamily">
>;
