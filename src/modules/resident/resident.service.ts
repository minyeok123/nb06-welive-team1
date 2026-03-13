import { Prisma } from '@prisma/client';
import { ResidentRepo } from './resident.repo';
import { CustomError } from '@/libs/error';
import { residentListDto, personalRosterDto } from './dto/response.dto';

export class ResidentService {
  constructor(private residentRepo: ResidentRepo) {}

  getResidentRosterList = async (
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
    const result = await this.residentRepo.getResidentList(whereCondition, page, limit);
    if (result.totalCount === 0) {
      throw new CustomError(400, '입주민 목록 조회 실패');
    }

    return {
      residents: residentListDto(result.rosters),
      message: '입주민 목록 조회 성공',
      count: result.rosters.length,
      totalCount: result.totalCount,
    };
  };

  createRoster = async (
    building: number,
    unitNumber: number,
    contact: string,
    name: string,
    isHouseholder: 'HOUSEHOLDER' | 'MEMBER',
    adminId: string,
    aptId: string,
  ) => {
    const roster = await this.residentRepo.createRoster(
      building,
      unitNumber,
      contact,
      name,
      isHouseholder,
      adminId,
      aptId,
    );
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
    return personalRosterDto(roster);
  };
}
