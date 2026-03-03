interface LoginDtoOptions {
  id: number;
  name: string;
  nickname: string;
  email: string;
  aptId: number;
  register_status: string;
  role: string;
  phoneNumber: string;
  profileImg: string | null;
  apartment: {
    aptName: string;
  };
  resident: {
    dong: number;
  } | null;
  boards: {
    id: number;
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
    apartmentId: options.aptId,
    apartmentName: options.apartment.aptName,
    residentDong: options.resident?.dong,
    boardIds: {
      COMPLAINT: options.boards.find((board) => board.boardType === 'COMPLAINT')?.id,
      NOTICE: options.boards.find((board) => board.boardType === 'NOTICE')?.id,
      POLL: options.boards.find((board) => board.boardType === 'VOTE')?.id,
    },
    username: options.nickname,
    contact: options.phoneNumber,
    avatar: options.profileImg,
  };
};
