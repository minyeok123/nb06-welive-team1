import { Prisma } from '@prisma/client';
import { ResidentRepo } from './resident.repo';
import { CustomError } from '@/libs/error';
import { rosterListDto, personalRosterDto } from './dto/response.dto';
import { CreateRosterBody, PatchRosterBody, CsvRosterRecord } from '@/types/resident.types';
import { parse } from 'csv-parse/sync';
import iconv from 'iconv-lite';

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

  createRostersFromCsv = async (adminId: string, aptId: string, fileBuffer?: Buffer) => {
    if (!fileBuffer) {
      throw new CustomError(400, '업로드된 파일이 없습니다.');
    }

    // 1. 인코딩 감지 및 변환: 일단 utf-8로 시도해보고, 한글이 깨지는 패턴()이 보이면 cp949(윈도우 엑셀)로 간주.
    let csvString = fileBuffer.toString('utf-8');
    console.log('1');
    console.log(csvString);
    // utf-8로 읽었을 때 한글이 깨지면 대체문자('\uFFFD')가 생김.
    // 만약 대체문자가 발견되면 윈도우(euc-kr/cp949) 인코딩으로 간주하고 iconv로 다시 디코딩.
    if (csvString.includes('\uFFFD')) {
      csvString = iconv.decode(fileBuffer, 'cp949');
      console.log('cp949');
    }
    console.log('2');
    console.log(csvString);
    // 파일 맨 앞에 BOM(\uFEFF)이 있으면 파싱에 방해되므로 제거.
    if (csvString.charCodeAt(0) === 0xfeff) {
      csvString = csvString.slice(1);
      console.log('bom');
    }
    console.log('3');
    console.log(csvString);
    // 2. CSV 동기식 파싱
    const records = parse(csvString, {
      columns: true, // 첫 줄(헤더)을 키값으로 사용 ('동', '호수', '이름', ...)
      skip_empty_lines: true,
      trim: true, // 양끝 공백 자동 제거
    }) as CsvRosterRecord[];

    console.log(records);
    if (records.length === 0) {
      throw new CustomError(400, 'CSV 파일에 유효한 데이터가 없습니다.');
    }

    // 3. 파싱된 데이터를 Prisma createMany 형태에 맞게 변환
    const rostersData: Prisma.residentRosterCreateManyInput[] = records.map(
      (record: CsvRosterRecord, index: number) => {
        const dong = parseInt(record['동'], 10);
        const ho = parseInt(record['호수'], 10);
        const name = record['이름'];
        const phoneNumber = record['연락처'];
        const isHouseholdStr = record['세대주여부'];

        if (isNaN(dong) || isNaN(ho) || !name || !phoneNumber || !isHouseholdStr) {
          throw new CustomError(
            400,
            `${index + 1}번째 데이터의 입력 형식이 잘못되었습니다. 템플릿 형식에 맞춰 주세요.`,
          );
        }

        return {
          dong,
          ho,
          name,
          phoneNumber,
          is_houseHold: isHouseholdStr === 'HOUSEHOLDER' ? 'HOUSEHOLDER' : 'MEMBER',
          adminId,
          aptId,
        };
      },
    );

    // 4. 레포지토리의 createRosters 호출 (데이터베이스에 일괄 추가)
    const result = await this.residentRepo.createRosters(rostersData);

    if (result.count === 0) {
      throw new CustomError(
        400,
        'CSV로 등록할 새로운 입주민이 없거나 이미 모두 등록되어 있습니다.',
      );
    }

    return {
      message: `${result.count}명의 입주민이 등록되었습니다.`,
      count: result.count,
    };
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
