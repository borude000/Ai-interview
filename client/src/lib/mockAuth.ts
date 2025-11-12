interface MockUser {
  id: string;
  username: string;
  password: string; // stored in plain text for mock only
}

const STORAGE_KEY = 'mock_users_v1';

function loadUsers(): MockUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as MockUser[] : [];
  } catch {
    return [];
  }
}

function saveUsers(users: MockUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function mockSignup(username: string, password: string) {
  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    return { ok: false, message: 'Username already exists' };
  }
  const user: MockUser = { id: makeId(), username, password };
  users.push(user);
  saveUsers(users);
  // Return a fake token
  const token = `mock-${user.id}-${Date.now()}`;
  return { ok: true, user: { id: user.id, username: user.username }, token };
}

export async function mockLogin(username: string, password: string) {
  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return { ok: false, message: 'Invalid credentials' };
  }
  const token = `mock-${user.id}-${Date.now()}`;
  return { ok: true, user: { id: user.id, username: user.username }, token };
}

export function clearMockUsers() {
  localStorage.removeItem(STORAGE_KEY);
}
