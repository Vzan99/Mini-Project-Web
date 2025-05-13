export default interface ILogin {
  email: string;
  password: string;
}

// Match the backend response structure
export interface ILoginResponse {
  message: string;
  user: {
    token: string;
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
    };
  };
}
