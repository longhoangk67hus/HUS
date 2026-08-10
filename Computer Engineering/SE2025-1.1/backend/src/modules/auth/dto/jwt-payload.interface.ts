/**
 * JWT Payload interface
 */
export interface JwtPayload {
  userId: string;
  userName: string;
  email: string;
  fullName: string;
  roles: string[]; // Array of role codes: ['USER', 'ADMIN']
}

/**
 * Login response
 */
export interface LoginResponse {
  token: string;
  user: {
    userId: string;
    userName: string;
    email: string;
    fullName: string;
    roles: string[];
  };
}
