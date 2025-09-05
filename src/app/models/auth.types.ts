export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  _id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    _id: number;
    username: string;
    email: string;
  };
}
