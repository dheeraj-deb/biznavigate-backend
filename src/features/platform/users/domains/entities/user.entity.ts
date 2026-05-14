export class User {
  user_id: string;
  business_id: string;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
  created_at?: Date;

  constructor(
    user_id: string,
    business_id: string,
    name: string,
    email: string,
    role: string,
    is_active: boolean = true,
    created_at?: Date
  ) {
    this.user_id = user_id;
    this.business_id = business_id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.is_active = is_active;
    this.created_at = created_at || new Date();
  }
}
