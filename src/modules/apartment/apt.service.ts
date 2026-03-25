import { AptRepo } from '@/modules/apartment/apt.repo';
import { Prisma, RegisterStatus, Role } from '@prisma/client';
import {
  aptListDto,
  aptListForSignUpDto,
  aptDetailDto,
  aptDetailPublicDto,
} from '@/modules/apartment/dto/response.dto';
import { CustomError } from '@/libs/error';
import { withoutPasswordUser } from '@/types/user.types';

export class AptService {
  constructor(private aptRepo: AptRepo) {}

  getListAptForSignUp = async (data: { keyword?: string; name?: string; address?: string }) => {
    let whereCondition: Prisma.ApartmentWhereInput = {
      deletedAt: null,
      aptStatus: 'APPROVED',
    };

    if (data.keyword) {
      whereCondition.OR = [
        { aptName: { contains: data.keyword, mode: 'insensitive' } },
        { aptAddress: { contains: data.keyword, mode: 'insensitive' } },
      ];
    }
    if (data.name) {
      whereCondition.aptName = { contains: data.name, mode: 'insensitive' };
    }
    if (data.address) {
      whereCondition.aptAddress = { contains: data.address };
    }

    const { totalCount, aptList } = await this.aptRepo.getListAptForSignUp(whereCondition);

    if (totalCount > 100) {
      throw new CustomError(
        404,
        `검색 결과가 너무 많습니다(${totalCount}건). 검색어를 더 상세하게 입력해주세요.`,
      );
    }

    return {
      apartments: aptListForSignUpDto(aptList),
      count: totalCount,
    };
  };

  getListApt = async (query: {
    name?: string;
    address?: string;
    searchKeyword?: string;
    apartmentStatus?: string;
    page?: number;
    limit?: number;
  }) => {
    let whereCondition: Prisma.ApartmentWhereInput = {
      deletedAt: null,
    };

    if (query.name) {
      whereCondition.aptName = { contains: query.name, mode: 'insensitive' };
    }
    if (query.address) {
      whereCondition.aptAddress = { contains: query.address, mode: 'insensitive' };
    }
    if (query.searchKeyword) {
      whereCondition.OR = [
        { aptName: { contains: query.searchKeyword, mode: 'insensitive' } },
        { aptAddress: { contains: query.searchKeyword, mode: 'insensitive' } },
        {
          users: {
            some: {
              role: Role.ADMIN,
              OR: [
                { name: { contains: query.searchKeyword, mode: 'insensitive' } },
                { email: { contains: query.searchKeyword, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }
    if (query.apartmentStatus) {
      whereCondition.aptStatus = { equals: query.apartmentStatus as RegisterStatus };
    }

    const { totalCount, apartments, pendingAdminRegisters } = await this.aptRepo.getListApt(
      whereCondition,
      query.page!,
      query.limit!,
    );

    if (apartments.length === 0) {
      throw new CustomError(404, '아파트 목록 조회 실패');
    }

    const pendingAdminByAptId = new Map<
      string,
      { id: string; name: string; email: string; phoneNumber: string }
    >();
    for (const r of pendingAdminRegisters) {
      if (r.aptId) {
        pendingAdminByAptId.set(r.aptId, {
          id: r.id,
          name: r.name,
          email: r.email,
          phoneNumber: r.phoneNumber,
        });
      }
    }

    return {
      apartments: aptListDto(apartments, pendingAdminByAptId),
      count: totalCount,
    };
  };

  getAptDetail = async (id: string, user: withoutPasswordUser) => {
    if (user.role === 'ADMIN' && user.aptId !== id) {
      throw new CustomError(403, '본인 소속 아파트 정보만 조회할 수 있습니다.');
    }

    const aptDetail = await this.aptRepo.getAptDetail(id);
    if (!aptDetail) {
      throw new CustomError(404, '아파트 상세 조회 실패');
    }
    return aptDetailDto(aptDetail);
  };

  getAptDetailPublic = async (id: string) => {
    const aptDetail = await this.aptRepo.getAptDetail(id);
    if (!aptDetail || aptDetail.aptStatus !== 'APPROVED') {
      throw new CustomError(404, '아파트 상세 조회 실패');
    }
    return aptDetailPublicDto(aptDetail);
  };
}
