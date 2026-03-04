interface LoginDtoOptions {
  id: string;
  name: string;
  username: string;
  email: string;
  aptId: string | null;
  register_status: string;
  role: string;
  phoneNumber: string;
  profileImg: string | null;
  deletedAt: Date | null;
  apartment: {
    aptName: string;
    boards: {
      id: string;
      boardType: string;
    }[];
  } | null;
  resident: {
    dong: number;
  } | null;
}

export const loginDto = (options: LoginDtoOptions) => {
  return {
    id: options.id,
    name: options.name,
    email: options.email,
    role: options.role,
    joinStatus: options.register_status,
    isActive: options.deletedAt === null && options.register_status === 'APPROVED',
    apartmentId: options.aptId ?? null,
    apartmentName: options.apartment?.aptName ?? null,
    residentDong: options.resident?.dong,
    boardIds: {
      COMPLAINT: options.apartment?.boards.find((board) => board.boardType === 'COMPLAINT')?.id,
      NOTICE: options.apartment?.boards.find((board) => board.boardType === 'NOTICE')?.id,
      POLL: options.apartment?.boards.find((board) => board.boardType === 'VOTE')?.id,
    },
    username: options.username,
    contact: options.phoneNumber,
    avatar: options.profileImg,
  };
};
