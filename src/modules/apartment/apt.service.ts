import { AptRepo } from './apt.repo';

export class AptService {
  constructor(private aptRepo: AptRepo) {}

  getListApt = async (keyword?: string, name?: string, adress?: string) => {
    let whereCondition = {};

    if (keyword) {
      whereCondition = {
        OR: [{ aptName: { contains: keyword } }, { aptAddress: { contains: keyword } }],
      };
    } else if (name) {
      whereCondition = { aptName: { contains: name } };
    } else if (adress) {
      whereCondition = { aptAddress: { contains: adress } };
    }

    const { totalCount, aptList } = await this.aptRepo.getListApt(whereCondition);

    if (totalCount > 100) {
      throw new Error(
        `검색 결과가 너무 많습니다(${totalCount}건). 검색어를 더 상세하게 입력해주세요.`,
      );
    }
    const response = {
      apartments: aptList,
      count: totalCount,
    };

    return response;
  };
}
