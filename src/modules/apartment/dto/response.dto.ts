import { RegisterStatus } from '@prisma/client';

const makeDongString = (complex: number, dong: number) => String(complex * 100 + dong);
const makeHoString = (floor: number, ho: number) => String(floor * 100 + ho);

export const aptListForSignUpDto = (apt: aptListForSignUpDtoType[]) => {
  return apt.map((apt) => {
    return {
      id: apt.id,
      name: apt.aptName,
      address: apt.aptAddress,
    };
  });
};

type PendingAdminRegisterRow = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
};

/** 승인 대기 중에는 User가 없고 Register만 있음 — 가입 승인 API는 Register id가 필요 */
export const aptListDto = (
  rows: aptDtoType[],
  pendingAdminByAptId: Map<string, PendingAdminRegisterRow> = new Map(),
) => {
  return rows.map((row) => {
    const adminUser = row.users[0];
    const pending = pendingAdminByAptId.get(row.id);
    return {
      id: row.id,
      name: row.aptName,
      address: row.aptAddress,
      officeNumber: row.officeNumber,
      description: row.description,
      startComplexNumber: row.startComplexNumber,
      endComplexNumber: row.endComplexNumber,
      startDongNumber: row.startDongNumber,
      endDongNumber: row.endDongNumber,
      startFloorNumber: row.startFloorNumber,
      endFloorNumber: row.endFloorNumber,
      startHoNumber: row.startHoNumber,
      endHoNumber: row.endHoNumber,
      apartmentStatus: row.aptStatus,
      adminRegisterId: pending?.id ?? null,
      adminId: adminUser?.id ?? '',
      adminName: adminUser?.name ?? pending?.name ?? '',
      adminEmail: adminUser?.email ?? pending?.email ?? '',
      adminContact: adminUser?.phoneNumber ?? pending?.phoneNumber ?? '',
      dongRange: {
        start: makeDongString(row.startComplexNumber, row.startDongNumber),
        end: makeDongString(row.endComplexNumber, row.endDongNumber),
      },
      hoRange: {
        start: makeHoString(row.startFloorNumber, row.startHoNumber),
        end: makeHoString(row.endFloorNumber, row.endHoNumber),
      },
    };
  });
};

export const aptDetailDto = (apt: aptDtoType) => {
  const adminUser = apt.users[0];
  return {
    id: apt.id,
    name: apt.aptName,
    address: apt.aptAddress,
    officeNumber: apt.officeNumber,
    description: apt.description,
    startComplexNumber: apt.startComplexNumber,
    endComplexNumber: apt.endComplexNumber,
    startDongNumber: apt.startDongNumber,
    endDongNumber: apt.endDongNumber,
    startFloorNumber: apt.startFloorNumber,
    endFloorNumber: apt.endFloorNumber,
    startHoNumber: apt.startHoNumber,
    endHoNumber: apt.endHoNumber,
    apartmentStatus: apt.aptStatus,
    adminId: adminUser?.id ?? '',
    adminName: adminUser?.name ?? '',
    adminEmail: adminUser?.email ?? '',
    adminContact: adminUser?.phoneNumber ?? '',
    dongRange: {
      start: makeDongString(apt.startComplexNumber, apt.startDongNumber),
      end: makeDongString(apt.endComplexNumber, apt.endDongNumber),
    },
    hoRange: {
      start: makeHoString(apt.startFloorNumber, apt.startHoNumber),
      end: makeHoString(apt.endFloorNumber, apt.endHoNumber),
    },
  };
};

export const aptDetailPublicDto = (apt: aptDtoType) => {
  return {
    id: apt.id,
    name: apt.aptName,
    address: apt.aptAddress,
    startComplexNumber: apt.startComplexNumber,
    endComplexNumber: apt.endComplexNumber,
    startDongNumber: apt.startDongNumber,
    endDongNumber: apt.endDongNumber,
    startFloorNumber: apt.startFloorNumber,
    endFloorNumber: apt.endFloorNumber,
    startHoNumber: apt.startHoNumber,
    endHoNumber: apt.endHoNumber,
    dongRange: {
      start: makeDongString(apt.startComplexNumber, apt.startDongNumber),
      end: makeDongString(apt.endComplexNumber, apt.endDongNumber),
    },
    hoRange: {
      start: makeHoString(apt.startFloorNumber, apt.startHoNumber),
      end: makeHoString(apt.endFloorNumber, apt.endHoNumber),
    },
  };
};

type aptDtoType = {
  id: string;
  aptName: string;
  aptAddress: string;
  officeNumber: string;
  description: string;
  startComplexNumber: number;
  endComplexNumber: number;
  startDongNumber: number;
  endDongNumber: number;
  startFloorNumber: number;
  endFloorNumber: number;
  startHoNumber: number;
  endHoNumber: number;
  aptStatus: RegisterStatus;
  users: {
    name: string;
    id: string;
    email: string;
    phoneNumber: string;
  }[];
};

type aptListForSignUpDtoType = Pick<aptDtoType, 'id' | 'aptName' | 'aptAddress'>;
