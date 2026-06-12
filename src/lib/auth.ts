import { User, UserRole } from '@/types';

const STORAGE_KEY = 'solarphase_user';
const USERS_KEY = 'solarphase_users';

export function getStoredUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export const ROLE_DETAILS: Record<UserRole, { name: string; email: string; company?: string }> = {
  'Residential Customer': { name: 'Elena Morrison', email: 'elena@solarhome.com' },
  'Commercial Business': { name: 'Carlos Reyes', email: 'carlos@solarcorp.com', company: 'SolarCorp' },
  'Solar Installer': { name: 'James Okafor', email: 'james@brightgrid.com', company: 'BrightGrid Solar' },
  'Maintenance Technician': { name: 'Sophie Laurent', email: 'sophie@techteam.io' },
  'Financing Partner': { name: 'Priya Nair', email: 'priya@greenfinance.io' },
  'Enterprise Energy Manager': { name: 'Marcus Wei', email: 'marcus@enterprise.com', company: 'GreenCorp Industries' },
  'Admin': { name: 'Alex Vance', email: 'alex.vance@solarphase.com' },
};

export function loginAsDemo(role: UserRole): User {
  const details = ROLE_DETAILS[role] || { name: 'Alex Vance', email: 'alex.vance@solarphase.com' };
  const demoUser: User = {
    id: `demo_${role.replace(/\s+/g, '_').toLowerCase()}`,
    name: details.name,
    email: details.email,
    role,
    company: details.company,
    createdAt: new Date().toISOString(),
    isDemo: true,
  };
  setStoredUser(demoUser);
  return demoUser;
}

export function registerUser(name: string, email: string, _password: string, role: UserRole): User {
  const users = getStoredUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) throw new Error('An account with this email already exists.');
  const user: User = {
    id: `user_${Date.now()}`,
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  setStoredUser(user);
  return user;
}

export function loginUser(email: string, _password: string): User {
  const users = getStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    const demoUser: User = {
      id: `user_demo_${Date.now()}`,
      name: email.split('@')[0].replace(/[^a-zA-Z ]/g, ' ').trim() || 'Solar User',
      email,
      role: 'Residential Customer',
      createdAt: new Date().toISOString(),
    };
    const allUsers = [...users, demoUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    setStoredUser(demoUser);
    return demoUser;
  }
  setStoredUser(user);
  return user;
}

export function updateUserProfile(updates: Partial<User>): User {
  const current = getStoredUser();
  if (!current) throw new Error('No user logged in');
  const updated = { ...current, ...updates };
  setStoredUser(updated);
  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx !== -1) {
    users[idx] = updated;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  return updated;
}

export function logoutUser(): void {
  removeStoredUser();
}
