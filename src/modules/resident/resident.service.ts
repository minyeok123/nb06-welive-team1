import { Prisma } from '@prisma/client';
import { ResidentRepo } from './resident.repo';
import { CustomError } from '@/libs/error';
import { rosterListDto, personalRosterDto } from './dto/response.dto';
import { CreateRosterBody, PatchRosterBody } from '@/types/resident.types';

export class ResidentService {
  constructor(private residentRepo: ResidentRepo) {}

  getRosterList = async (
    adminId: string,
    page: number,
    limit: number,
    dong?: number,
    ho?: number,
    is_residence?: boolean,
    is_registered?: boolean,
    keyword?: string,
  ) => {
    let whereCondition: Prisma.residentRosterWhereInput = {
      adminId,
      deletedAt: null,
    };

    if (dong) {
      whereCondition.dong = dong;
    }
    if (ho) {
      whereCondition.ho = ho;
    }
    if (is_residence !== undefined) {
      whereCondition.is_residence = is_residence;
    }
    if (is_registered !== undefined) {
      whereCondition.is_registered = is_registered;
    }
    if (keyword) {
      whereCondition.OR = [{ name: { contains: keyword } }, { phoneNumber: { contains: keyword } }];
    }
    const result = await this.residentRepo.getRosterList(whereCondition, page, limit);
    if (result.totalCount === 0) {
      throw new CustomError(400, '입주민 목록 조회 실패');
    }

    return {
      residents: rosterListDto(result.rosters),
      message: '입주민 목록 조회 성공',
      count: result.rosters.length,
      totalCount: result.totalCount,
    };
  };

  createRoster = async ({ data }: { data: CreateRosterBody }) => {
    const findRoster = await this.residentRepo.findRosterByContact(data.contact);
    if (findRoster) {
      throw new CustomError(400, '이미 존재하는 입주민입니다');
    }

    const roster = await this.residentRepo.createRoster({ data });
    if (!roster) {
      throw new CustomError(400, '입주민 등록 실패');
    }
    return personalRosterDto(roster);
  };

  getRosterDetail = async (id: string) => {
    const roster = await this.residentRepo.getRosterDetail(id);
    if (!roster) {
      throw new CustomError(400, '입주민 상세 조회 실패');
    }
    if (roster.deletedAt) {
      throw new CustomError(400, '입주민 정보가 삭제되었습니다');
    }
    return personalRosterDto(roster);
  };

  patchRoster = async ({ data }: { data: PatchRosterBody }) => {
    const roster = await this.residentRepo.patchRoster({ data });
    if (!roster) {
      throw new CustomError(400, '입주민 정보 수정 실패');
    }

    if (roster.userId && data.isHouseholder) {
      const patchedUser = await this.residentRepo.patchUser({
        data: { userId: roster.userId, isHouseholder: data.isHouseholder },
      });
    }
    return personalRosterDto(roster);
  };

  softDeleteRoster = async (id: string) => {
    const roster = await this.residentRepo.softDeleteRoster(id);
    if (!roster) {
      throw new CustomError(400, '입주민 정보 삭제 실패');
    }
    return;
  };

  createRosterFromUser = async (userId: string, adminId: string, aptId: string) => {
    const register = await this.residentRepo.findRegister(userId);
    if (!register) {
      throw new CustomError(400, '입주민 등록 실패');
    }

    const findRoster = await this.residentRepo.findRosterByContact(register.phoneNumber!);
    if (findRoster) {
      throw new CustomError(400, '이미 존재하는 입주민입니다');
    }

    const roster = await this.residentRepo.createRosterFromUser({
      data: {
        dong: register.dong!,
        ho: register.ho!,
        name: register.name!,
        phoneNumber: register.phoneNumber!,
        adminId,
        aptId,
        is_registered: register.register_status === 'APPROVED' ? true : false,
      },
    });
    if (!roster) {
      throw new CustomError(400, '입주민 등록 실패');
    }
    return personalRosterDto(roster);
  };

  getFileRosterList = async (
    adminId: string,
    page: number,
    limit: number,
    dong?: number,
    ho?: number,
    is_residence?: boolean,
    is_registered?: boolean,
    keyword?: string,
  ) => {
    let whereCondition: Prisma.residentRosterWhereInput = {
      adminId,
      deletedAt: null,
    };

    if (dong) {
      whereCondition.dong = dong;
    }
    if (ho) {
      whereCondition.ho = ho;
    }
    if (is_residence !== undefined) {
      whereCondition.is_residence = is_residence;
    }
    if (is_registered !== undefined) {
      whereCondition.is_registered = is_registered;
    }
    if (keyword) {
      whereCondition.OR = [{ name: { contains: keyword } }, { phoneNumber: { contains: keyword } }];
    }
    const result = await this.residentRepo.getRosterList(whereCondition, page, limit);
    if (result.totalCount === 0) {
      throw new CustomError(400, '입주민 목록 조회 실패');
    }

    const csvHeader = '동,호수,이름,연락처,세대주여부\n';
    const csvRows = result.rosters
      .map((r) => `${r.dong},${r.ho},${r.name},\t${r.phoneNumber},${r.is_houseHold}`)
      .join('\n');

    return csvHeader + csvRows;
  };
}
