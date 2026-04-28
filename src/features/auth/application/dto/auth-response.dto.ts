
export class AuthResponseDto {
  access_token: string;

  refresh_token: string;

    user: {
    user_id: string;
    email: string;
    name: string;
    business_id: string;
    role_id: string;
    profile_completed: boolean;
  };
}
