import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const DB_HOST = process.env.DB_HOST ;
const DB_USER = process.env.DB_USER ;
const DB_PASSWORD = process.env.DB_PASSWORD ;
const DB_NAME = process.env.DB_NAME ;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const createDatabaseIfMissing = async () => {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
  });
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`✅ Database ensured: ${DB_NAME}`);
  } finally {
    await connection.end();
  }
};

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      firebase_uid VARCHAR(128),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      role ENUM('owner','employee') NOT NULL DEFAULT 'employee',
      picture TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      owner_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_org_owner FOREIGN KEY(owner_id) REFERENCES users(id)
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      organization_id VARCHAR(36) NOT NULL,
      role ENUM('employee','manager') DEFAULT 'employee',
      status ENUM('active','inactive','pending') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_emp_user FOREIGN KEY(user_id) REFERENCES users(id),
      CONSTRAINT fk_emp_org FOREIGN KEY(organization_id) REFERENCES organizations(id)
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(36) PRIMARY KEY,
      organization_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      description TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      duration_seconds INT DEFAULT 0,
      screenshot_count INT DEFAULT 0,
      status ENUM('pending','in_progress','completed') DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_task_org FOREIGN KEY(organization_id) REFERENCES organizations(id),
      CONSTRAINT fk_task_emp FOREIGN KEY(employee_id) REFERENCES employees(id)
    ) ENGINE=InnoDB;
  `);
};

const toCamel = (row = {}) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      value,
    ])
  );

const queries = {
  async createOrUpdateUser({ id = uuidv4(), firebaseUid = null, name, email, role = 'employee', picture = null }) {
    await pool.query(
      `
        INSERT INTO users (id, firebase_uid, name, email, role, picture)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          firebase_uid = VALUES(firebase_uid),
          name = VALUES(name),
          role = VALUES(role),
          picture = VALUES(picture)
      `,
      [id, firebaseUid, name, email, role, picture]
    );
    return this.getUserById(id);
  },

  async getUserById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] ? toCamel(rows[0]) : null;
  },

  async getUserByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] ? toCamel(rows[0]) : null;
  },

  async createOrganization({ id = uuidv4(), name, description = '', ownerId }) {
    await pool.query(
      `
        INSERT INTO organizations (id, name, description, owner_id)
        VALUES (?, ?, ?, ?)
      `,
      [id, name, description, ownerId]
    );
    return this.getOrganizationById(id);
  },

  async getOrganizationById(id) {
    const [rows] = await pool.query('SELECT * FROM organizations WHERE id = ?', [id]);
    return rows[0] ? toCamel(rows[0]) : null;
  },

  async getOrganizationsByOwner(ownerId) {
    const [rows] = await pool.query('SELECT * FROM organizations WHERE owner_id = ?', [ownerId]);
    return rows.map(toCamel);
  },

  async addEmployee({ id = uuidv4(), userId, organizationId, role = 'employee', status = 'active' }) {
    await pool.query(
      `
        INSERT INTO employees (id, user_id, organization_id, role, status)
        VALUES (?, ?, ?, ?, ?)
      `,
      [id, userId, organizationId, role, status]
    );
    return this.getEmployeeById(id);
  },

  async getEmployeeById(id) {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0] ? toCamel(rows[0]) : null;
  },

  async getEmployeeByUser(userId) {
    const [rows] = await pool.query('SELECT * FROM employees WHERE user_id = ?', [userId]);
    return rows[0] ? toCamel(rows[0]) : null;
  },

  async getEmployeesByOrganization(organizationId) {
    const [rows] = await pool.query('SELECT * FROM employees WHERE organization_id = ?', [organizationId]);
    return rows.map(toCamel);
  },

  async updateEmployee(id, data = {}) {
    const fields = [];
    const values = [];
    Object.entries(data).forEach(([key, val]) => {
      fields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`);
      values.push(val);
    });
    if (!fields.length) return this.getEmployeeById(id);
    values.push(id);
    await pool.query(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getEmployeeById(id);
  },

  async recordTask({
    id = uuidv4(),
    organizationId,
    employeeId,
    description,
    startTime = new Date(),
    endTime = new Date(),
    durationSeconds = 0,
    screenshotCount = 0,
    status = 'completed',
  }) {
    await pool.query(
      `
        INSERT INTO tasks (
          id, organization_id, employee_id, description,
          start_time, end_time, duration_seconds, screenshot_count, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        organizationId,
        employeeId,
        description,
        startTime,
        endTime,
        durationSeconds,
        screenshotCount,
        status,
      ]
    );
    return this.getTaskById(id);
  },

  async getTaskById(id) {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows[0] ? toCamel(rows[0]) : null;
  },

  async getTasksByEmployee(employeeId) {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE employee_id = ? ORDER BY created_at DESC',
      [employeeId]
    );
    return rows.map(toCamel);
  },

  async getTasksByOrganization(organizationId) {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE organization_id = ? ORDER BY created_at DESC',
      [organizationId]
    );
    return rows.map(toCamel);
  },

  async organizationSnapshot(organizationId) {
    const [orgRows] = await pool.query('SELECT * FROM organizations WHERE id = ?', [organizationId]);
    if (!orgRows.length) return null;

    const [employeeRows] = await pool.query(
      `
        SELECT e.*, u.name AS user_name, u.email AS user_email
        FROM employees e
        JOIN users u ON u.id = e.user_id
        WHERE e.organization_id = ?
      `,
      [organizationId]
    );

    const [taskRows] = await pool.query(
      `
        SELECT t.*, u.name AS employee_name, u.email AS employee_email
        FROM tasks t
        JOIN employees e ON e.id = t.employee_id
        JOIN users u ON u.id = e.user_id
        WHERE t.organization_id = ?
        ORDER BY t.created_at DESC
      `,
      [organizationId]
    );

    return {
      organization: toCamel(orgRows[0]),
      employees: employeeRows.map(toCamel),
      tasks: taskRows.map(toCamel),
    };
  },
};

const initMySql = async () => {
  await createDatabaseIfMissing();
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    await createTables();
    console.log('✅ MySQL connected and tables verified');
  } finally {
    connection.release();
  }
};

export { pool, initMySql, queries };

