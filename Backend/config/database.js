// In-memory database for development
// In production, replace this with a real database (MongoDB, PostgreSQL, etc.)

const database = {
  users: new Map(),
  companies: new Map(),
  employees: new Map(),
  tasks: new Map(),
  screenshots: new Map(),
  invitations: new Map(),
};

// Helper functions for database operations
export const db = {
  // User operations
  users: {
    create: (id, data) => {
      database.users.set(id, { ...data, id, createdAt: new Date().toISOString() });
      return database.users.get(id);
    },
    findById: (id) => database.users.get(id),
    findByEmail: (email) => {
      for (const user of database.users.values()) {
        if (user.email === email) return user;
      }
      return null;
    },
    update: (id, data) => {
      const user = database.users.get(id);
      if (user) {
        database.users.set(id, { ...user, ...data, updatedAt: new Date().toISOString() });
        return database.users.get(id);
      }
      return null;
    },
    delete: (id) => database.users.delete(id),
    getAll: () => Array.from(database.users.values()),
  },

  // Company operations
  companies: {
    create: (id, data) => {
      database.companies.set(id, { ...data, id, createdAt: new Date().toISOString() });
      return database.companies.get(id);
    },
    findById: (id) => database.companies.get(id),
    findByOwnerId: (ownerId) => {
      for (const company of database.companies.values()) {
        if (company.ownerId === ownerId) return company;
      }
      return null;
    },
    update: (id, data) => {
      const company = database.companies.get(id);
      if (company) {
        database.companies.set(id, { ...company, ...data, updatedAt: new Date().toISOString() });
        return database.companies.get(id);
      }
      return null;
    },
    delete: (id) => database.companies.delete(id),
    getAll: () => Array.from(database.companies.values()),
  },

  // Employee operations
  employees: {
    create: (id, data) => {
      database.employees.set(id, { ...data, id, createdAt: new Date().toISOString() });
      return database.employees.get(id);
    },
    findById: (id) => database.employees.get(id),
    findByUserId: (userId) => {
      for (const employee of database.employees.values()) {
        if (employee.userId === userId) return employee;
      }
      return null;
    },
    findByCompanyId: (companyId) => {
      return Array.from(database.employees.values()).filter(
        (emp) => emp.companyId === companyId
      );
    },
    update: (id, data) => {
      const employee = database.employees.get(id);
      if (employee) {
        database.employees.set(id, { ...employee, ...data, updatedAt: new Date().toISOString() });
        return database.employees.get(id);
      }
      return null;
    },
    delete: (id) => database.employees.delete(id),
    getAll: () => Array.from(database.employees.values()),
  },

  // Task operations
  tasks: {
    create: (id, data) => {
      database.tasks.set(id, { ...data, id, createdAt: new Date().toISOString() });
      return database.tasks.get(id);
    },
    findById: (id) => database.tasks.get(id),
    findByEmployeeId: (employeeId) => {
      return Array.from(database.tasks.values())
        .filter((task) => task.employeeId === employeeId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findByCompanyId: (companyId) => {
      return Array.from(database.tasks.values())
        .filter((task) => task.companyId === companyId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    update: (id, data) => {
      const task = database.tasks.get(id);
      if (task) {
        database.tasks.set(id, { ...task, ...data, updatedAt: new Date().toISOString() });
        return database.tasks.get(id);
      }
      return null;
    },
    delete: (id) => database.tasks.delete(id),
    getAll: () => Array.from(database.tasks.values()),
  },

  // Screenshot operations
  screenshots: {
    create: (id, data) => {
      database.screenshots.set(id, { ...data, id, createdAt: new Date().toISOString() });
      return database.screenshots.get(id);
    },
    findById: (id) => database.screenshots.get(id),
    findByTaskId: (taskId) => {
      return Array.from(database.screenshots.values())
        .filter((screenshot) => screenshot.taskId === taskId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findByEmployeeId: (employeeId) => {
      return Array.from(database.screenshots.values())
        .filter((screenshot) => screenshot.employeeId === employeeId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    delete: (id) => database.screenshots.delete(id),
    getAll: () => Array.from(database.screenshots.values()),
  },

  // Invitation operations
  invitations: {
    create: (token, data) => {
      database.invitations.set(token, { ...data, token, createdAt: new Date().toISOString() });
      return database.invitations.get(token);
    },
    findByToken: (token) => database.invitations.get(token),
    delete: (token) => database.invitations.delete(token),
    getAll: () => Array.from(database.invitations.values()),
  },
};

export default db;

