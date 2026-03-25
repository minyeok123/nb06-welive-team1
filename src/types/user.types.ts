interface USER {
  id: string;
  email: string;
  profileImg: string | null;
  username: string;
  aptId: string | null;
  name: string;
  phoneNumber: string;
  role: string;
  password: string;
  register_status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type withoutPasswordUser = Omit<USER, 'password'>;
