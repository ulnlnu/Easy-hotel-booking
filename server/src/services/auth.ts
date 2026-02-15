/**
 * server/src/services/auth.ts
 * 认证服务层
 */

import fs from 'fs/promises';
import path from 'path';
import { hashPassword } from '../utils/password';
import type { User, RegisterRequest } from '../../../shared/types/user';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * 确保数据目录存在
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // 目录已存在，忽略
  }
}

/**
 * 读取用户数据
 */
async function readUsers(): Promise<User[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(data);

    // 如果文件存在但为空数组，初始化默认管理员
    if (users.length === 0) {
      return await initializeDefaultAdmin();
    }

    return users;
  } catch (error) {
    // 文件不存在，初始化默认管理员
    return await initializeDefaultAdmin();
  }
}

/**
 * 初始化默认管理员账号
 */
async function initializeDefaultAdmin(): Promise<User[]> {
  const hashedPassword = await hashPassword('admin123');

  const adminUser: User = {
    id: generateId(),
    username: 'admin',
    password: hashedPassword,
    realName: '系统管理员',
    role: 'admin',
    phone: '13800138000',
    email: 'admin@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await writeUsers([adminUser]);
  console.log('✅ 已初始化默认管理员账号: admin / admin123');
  return [adminUser];
}

/**
 * 写入用户数据
 */
async function writeUsers(users: User[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * 生成ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 认证服务
 */
export const authService = {
  /**
   * 根据用户名查找用户
   */
  findByUsername: async (username: string): Promise<User | null> => {
    const users = await readUsers();
    return users.find(u => u.username === username) || null;
  },

  /**
   * 根据ID查找用户
   */
  findById: async (id: string): Promise<User | null> => {
    const users = await readUsers();
    return users.find(u => u.id === id) || null;
  },

  /**
   * 创建用户
   */
  create: async (data: RegisterRequest & { password: string }): Promise<User> => {
    const users = await readUsers();

    const now = new Date().toISOString();
    const newUser: User = {
      id: generateId(),
      username: data.username,
      password: data.password,
      realName: data.realName,
      role: data.role,
      phone: data.phone,
      email: data.email,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    await writeUsers(users);

    return newUser;
  },

  /**
   * 更新用户
   */
  update: async (id: string, updates: Partial<User>): Promise<void> => {
    const users = await readUsers();
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      throw new Error('用户不存在');
    }

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await writeUsers(users);
  },

  /**
   * 获取所有用户（仅系统管理员）
   */
  findAll: async (): Promise<User[]> => {
    return await readUsers();
  },

  /**
   * 删除用户（仅系统管理员）
   */
  delete: async (id: string): Promise<void> => {
    const users = await readUsers();
    const filteredUsers = users.filter(u => u.id !== id);

    if (users.length === filteredUsers.length) {
      throw new Error('用户不存在');
    }

    await writeUsers(filteredUsers);
  },
};
