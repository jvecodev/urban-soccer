export interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
}
