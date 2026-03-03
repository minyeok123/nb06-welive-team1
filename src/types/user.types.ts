interface USER {
  id: number;
  email: string;
  profileImg: string | null;
  nickname: string;
  aptId: number;
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
