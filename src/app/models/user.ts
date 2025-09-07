export interface User {
  id: number;
  username: string;
  email: string;
  token: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
}
