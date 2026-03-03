import bcrypt from 'bcryptjs';

export const Roles = Object.freeze({
  ADMIN: 'ADMIN',
  USER: 'USER'
});

export class User {
  constructor({ id, email, passwordHash, role }) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
  }

  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role
    };
  }
}

const users = [];

export async function seedUsers() {
  if (users.length > 0) {
    return;
  }

  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('user123', 10)
  ]);

  users.push(
    new User({
      id: 1,
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: Roles.ADMIN
    }),
    new User({
      id: 2,
      email: 'user@example.com',
      passwordHash: userHash,
      role: Roles.USER
    })
  );
}

export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

export function findUserById(id) {
  return users.find((user) => user.id === id);
}

export function listUsers() {
  return users.map((user) => user.toSafeJSON());
}
