export default interface IRegister {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  username: string;
  referral_code?: string;
  role: string;
}
