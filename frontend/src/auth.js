const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export function getStoredAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  return {
    token,
    user: userRaw ? JSON.parse(userRaw) : null
  };
}

export function setStoredAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
