import { Register } from '@prisma/client';
import { RosterFromUser } from '@/types/resident.types';

/**
 * Register 신청 정보를 명부 복구(Restore)용 DTO로 변환합니다.
 */
export const RosterFromUserDto = (register: Register): RosterFromUser => {
  return {
    dong: register.dong!,
    ho: register.ho!,
    name: register.name,
    phoneNumber: register.phoneNumber!,
    is_registered: register.register_status === 'APPROVED',
  };
};
