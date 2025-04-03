import Dexie, { Table } from 'dexie';

export interface Category {
    id: string;
    name: string;
    description: string | null;
    color: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Todo {
    id: string;
    title: string;
    description: string | null;
    priority: number;
    dueDate: Date | null;
    completed: boolean;
    completedAt: Date | null;
    categoryId: string | null;
    groupId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
    completedAt: Date | null;
    todoId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Group {
    id: string;
    name: string;
    description: string | null;
    color: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TodoTag {
    id: string;
    todoId: string;
    tagId: string;
}

export class JustInTimeDB extends Dexie {
    categories!: Table<Category>;
    todos!: Table<Todo>;
    subtasks!: Table<Subtask>;
    groups!: Table<Group>;
    todoTags!: Table<TodoTag>;

    constructor() {
        super('just-in-time-db');
        this.version(1).stores({
            categories: '++id, createdAt',
            todos: '++id, categoryId, groupId, createdAt',
            subtasks: '++id, todoId, createdAt',
            groups: '++id, createdAt',
            todoTags: '++id, todoId, tagId'
        });
    }
}

export const db = new JustInTimeDB();
