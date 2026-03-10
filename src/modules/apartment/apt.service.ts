import { AptRepo } from './apt.repo';
import { Prisma, RegisterStatus, Role } from '@prisma/client';
import { aptListDto } from './dto/response.dto';
import { TargetObjectKeyFormat$ } from '@aws-sdk/client-s3';

export class AptService {
  constructor(private aptRepo: AptRepo) {}

  getListAptForSignUp = async (keyword?: string, name?: string, adress?: string) => {
    let whereCondition: Prisma.ApartmentWhereInput = {};

    if (keyword) {
      whereCondition.OR = [
        { aptName: { contains: keyword } },
        { aptAddress: { contains: keyword } },
      ];
    }
    if (name) {
      whereCondition.aptName = { contains: name };
    }
    if (adress) {
      whereCondition.aptAddress = { contains: adress };
    }

    const { totalCount, aptList } = await this.aptRepo.getListAptForSignUp(whereCondition);

    if (totalCount > 100) {
      throw new Error(
        `검색 결과가 너무 많습니다(${totalCount}건). 검색어를 더 상세하게 입력해주세요.`,
      );
    }

    return {
      apartments: aptList,
      count: totalCount,
    };
  };

  getListApt = async (
    name?: string,
    address?: string,
    searchKeyword?: string,
    apartmentStatus?: string,
    page?: number,
    limit?: number,
  ) => {
    let whereCondition: Prisma.ApartmentWhereInput = {};

    if (name) {
      whereCondition.aptName = { contains: name };
    }
    if (address) {
      whereCondition.aptAddress = { contains: address };
    }
    if (searchKeyword) {
      whereCondition.OR = [
        { aptName: { contains: searchKeyword } },
        { aptAddress: { contains: searchKeyword } },
        {
          users: {
            some: {
              role: Role.ADMIN,
              OR: [{ name: { contains: searchKeyword } }, { email: { contains: searchKeyword } }],
            },
          },
        },
      ];
    }
    if (apartmentStatus) {
      whereCondition.aptStatus = { equals: apartmentStatus as RegisterStatus };
    }

    const { totalCount, apartments } = await this.aptRepo.getListApt(whereCondition, page!, limit!);

    if (apartments.length === 0) {
      throw new Error('아파트 목록 조회 실패');
    }
    return {
      apartments: aptListDto(apartments),
      count: totalCount,
    };
  };
}
