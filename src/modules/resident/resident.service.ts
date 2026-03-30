import { Prisma } from '@prisma/client';
import { ResidentRepo } from '@modules/resident/resident.repo';
import { CustomError } from '@libs/error';
import { rosterListDto, personalRosterDto } from '@modules/resident/dto/response.dto';
import { RosterFromUserDto } from '@modules/resident/dto/request.dto';
import { CreateRosterBody, PatchRosterBody, CsvRosterRecord } from '@app-types/resident.types';
import { parse } from 'csv-parse/sync';
import iconv from 'iconv-lite';
import { withoutPasswordUser } from '@app-types/user.types';
import { makeDong, makeHo } from '@modules/resident/utils/makeDongHo';

export class ResidentService {
  constructor(private residentRepo: ResidentRepo) {}

  getRosterList = async (
    user: withoutPasswordUser,
    query: {
      page: number;
      limit: number;
      building?: number;
      unitNumber?: number;
      residenceStatus?: boolean;
      isRegistered?: boolean;
      keyword?: string;
    },
  ) => {
    let whereCondition: Prisma.residentRosterWhereInput = {
      aptId: user.aptId!,
      deletedAt: null,
    };

    if (query.building) {
      whereCondition.dong = query.building;
    }
    if (query.unitNumber) {
      whereCondition.ho = query.unitNumber;
    }
    if (query.residenceStatus !== undefined) {
      whereCondition.is_residence = query.residenceStatus;
    }
    if (query.isRegistered !== undefined) {
      whereCondition.is_registered = query.isRegistered;
    }
    if (query.keyword) {
      whereCondition.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { phoneNumber: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    // Apartment 모델을 통해 한꺼번에 조회
    const aptData = await this.residentRepo.getResidentDataByAptId(
      user.aptId!,
      whereCondition,
      query.page,
      query.limit,
    );

    if (!aptData) {
      throw new CustomError(404, '해당 아파트 정보를 찾을 수 없습니다.');
    }

    const residents = rosterListDto(aptData.residentRoster, aptData.registers);

    return {
      residents,
      message: '입주민 목록 조회 성공',
      count: residents.length,
      totalCount: aptData._count.residentRoster + aptData._count.registers,
    };
  };

  createRoster = async (user: withoutPasswordUser, data: CreateRosterBody) => {
    if (data.isHouseholder === 'HOUSEHOLDER') {
      const existingHouseholder = await this.residentRepo.findHouseholder(
        user.aptId!,
        data.building,
        data.unitNumber,
      );
      if (existingHouseholder) {
        throw new CustomError(
          400,
          `${data.building}동 ${data.unitNumber}호에는 이미 등록된 세대주가 있습니다.`,
        );
      }
    }
    const findRoster = await this.residentRepo.findRosterByContact(data.contact);
    if (findRoster) {
      if (!findRoster.deletedAt) {
        throw new CustomError(400, '이미 존재하는 입주민입니다');
      } else {
        const restoredRoster = await this.residentRepo.restoreRoster(findRoster.id, data);
        return personalRosterDto(restoredRoster);
      }
    }

    const roster = await this.residentRepo.createRoster(user.id, user.aptId!, data);
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

    // utf-8로 읽었을 때 한글이 깨지면 대체문자('\uFFFD')가 생김.
    // 만약 대체문자가 발견되면 윈도우(euc-kr/cp949) 인코딩으로 간주하고 iconv로 다시 디코딩.
    if (csvString.includes('\uFFFD')) {
      csvString = iconv.decode(fileBuffer, 'cp949');
    }

    // 파일 맨 앞에 BOM(\uFEFF)이 있으면 파싱에 방해되므로 제거.
    if (csvString.charCodeAt(0) === 0xfeff) {
      csvString = csvString.slice(1);
    }
    // 2. CSV 동기식 파싱
    const records = parse(csvString, {
      columns: true, // 첫 줄(헤더)을 키값으로 사용 ('동', '호수', '이름', ...)
      skip_empty_lines: true,
      trim: true, // 양끝 공백 자동 제거
    }) as CsvRosterRecord[];

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

        if (
          isNaN(dong) ||
          isNaN(ho) ||
          !name ||
          !phoneNumber ||
          phoneNumber.includes('-') ||
          !isHouseholdStr
        ) {
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

  getRosterDetail = async (id: string, user: withoutPasswordUser) => {
    const roster = await this.residentRepo.getRosterDetail(id);
    if (!roster) {
      throw new CustomError(400, '입주민 상세 조회 실패');
    }
    if (roster.aptId !== user.aptId) {
      throw new CustomError(403, '소속 아파트 입주민만 조회 가능합니다.');
    }
    return personalRosterDto(roster);
  };

  patchRoster = async (id: string, data: PatchRosterBody, user: withoutPasswordUser) => {
    const existingRoster = await this.residentRepo.getRosterDetail(id);
    if (!existingRoster) throw new CustomError(404, '입주민 정보를 찾을 수 없습니다.');
    if (existingRoster.aptId !== user.aptId) throw new CustomError(403, '수정 권한이 없습니다.');

    //동 호수 범위 체크
    if (data.building !== undefined || data.unitNumber !== undefined) {
      const apartment = await this.residentRepo.findApartmentById(user.aptId!);
      if (!apartment) throw new CustomError(404, '아파트 정보를 찾을 수 없습니다.');

      const invalidDong = makeDong(apartment);
      const invalidHo = makeHo(apartment);
      if (data.building !== undefined) {
        if (data.building < invalidDong.min || data.building > invalidDong.max) {
          throw new CustomError(400, '동 범위가 올바르지 않습니다.');
        }
      }
      if (data.unitNumber !== undefined) {
        if (data.unitNumber < invalidHo.min || data.unitNumber > invalidHo.max) {
          throw new CustomError(400, '호 범위가 올바르지 않습니다.');
        }
      }
    }

    // 세대주 변경 또는 세대주 이사 시 하우스홀더 중복 검증
    const isChangingToHouseholder =
      data.isHouseholder === 'HOUSEHOLDER' && existingRoster.is_houseHold !== 'HOUSEHOLDER';
    const isHouseholderMoving =
      data.isHouseholder === 'HOUSEHOLDER' &&
      (data.building !== existingRoster.dong || data.unitNumber !== existingRoster.ho);
    if (isChangingToHouseholder || isHouseholderMoving) {
      const dong = data.building || existingRoster.dong;
      const ho = data.unitNumber || existingRoster.ho;
      const existingHouseholder = await this.residentRepo.findHouseholder(user.aptId!, dong, ho);
      if (existingHouseholder)
        throw new CustomError(400, '해당 세대에 이미 등록된 세대주가 있습니다.');
    }

    if (data.contact) {
      const findDuplicate = await this.residentRepo.findRosterByContact(data.contact);
      if (findDuplicate && findDuplicate.id !== id) {
        throw new CustomError(400, '이미 사용 중인 연락처입니다.');
      }
    }

    //유저정보 동기화
    const roster = await this.residentRepo.patchRoster(id, data);
    if (!roster) {
      throw new CustomError(400, '입주민 정보 수정 실패');
    }
    if (roster.userId && roster.is_registered) {
      const isChanged =
        existingRoster.name !== roster.name ||
        existingRoster.phoneNumber !== roster.phoneNumber ||
        existingRoster.dong !== roster.dong ||
        existingRoster.ho !== roster.ho ||
        existingRoster.is_houseHold !== roster.is_houseHold;
      if (isChanged) {
        await this.residentRepo.patchUser(roster.userId, {
          name: roster.name,
          phoneNumber: roster.phoneNumber,
          dong: roster.dong,
          ho: roster.ho,
          isHouseholder: roster.is_houseHold,
        });
      }
    }
    return personalRosterDto(roster);
  };

  softDeleteRoster = async (id: string) => {
    const existingRoster = await this.residentRepo.getRosterDetail(id);

    if (existingRoster) {
      const roster = await this.residentRepo.softDeleteRoster(
        existingRoster.id,
        existingRoster.userId,
      );
      if (!roster) throw new CustomError(400, '입주민 정보 삭제 실패');
      return;
    }

    // 명단에 없다면 가입 신청 테이블인지 확인.
    const existingRegister = await this.residentRepo.findRegister(id);
    if (!existingRegister) {
      throw new CustomError(404, '존재하지 않거나 이미 삭제된 정보입니다.');
    }

    // 신청서 데이터 삭제
    const deletedRegister = await this.residentRepo.softDeleteRegister(id);
    if (!deletedRegister) throw new CustomError(400, '가입 신청 정보 삭제 실패');

    return;
  };

  createRosterFromUser = async (userId: string, user: withoutPasswordUser) => {
    const register = await this.residentRepo.findRegister(userId);
    if (!register) {
      throw new CustomError(404, '유저 정보를 찾을 수 없습니다.');
    }

    const findRoster = await this.residentRepo.findRosterByContact(register.phoneNumber!);

    if (findRoster && !findRoster.deletedAt) {
      throw new CustomError(400, '이미 명부에 등록된 연락처입니다.');
    } else if (findRoster && findRoster.deletedAt) {
      const restored = await this.residentRepo.restoreRosterFromUser(
        findRoster.id,
        RosterFromUserDto(register),
      );
      return personalRosterDto(restored);
    }

    const roster = await this.residentRepo.createRosterFromUser(
      user.aptId!,
      user.id,
      RosterFromUserDto(register),
    );
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
