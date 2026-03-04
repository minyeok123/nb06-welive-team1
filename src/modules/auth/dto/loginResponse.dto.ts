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
  apartment: {
    aptName: string;
  } | null;
  resident: {
    dong: number;
  } | null;
  boards: {
    id: string;
    boardType: string;
  }[];
}

export const loginDto = (options: LoginDtoOptions) => {
  return {
    id: options.id,
    name: options.name,
    email: options.email,
    role: options.role,
    joinStatus: options.register_status,
    apartmentId: options.aptId ?? null,
    apartmentName: options.apartment?.aptName ?? null,
    residentDong: options.resident?.dong,
    boardIds: {
      COMPLAINT: options.boards.find((board) => board.boardType === 'COMPLAINT')?.id,
      NOTICE: options.boards.find((board) => board.boardType === 'NOTICE')?.id,
      POLL: options.boards.find((board) => board.boardType === 'VOTE')?.id,
    },
    username: options.username,
    contact: options.phoneNumber,
    avatar: options.profileImg,
  };
};
