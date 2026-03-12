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

export const aptListDto = (apt: aptDtoType[]) => {
  return apt.map((apt) => {
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
      adminId: apt.users[0].id,
      adminName: apt.users[0].name,
      adminEmail: apt.users[0].email,
      adminContact: apt.users[0].phoneNumber,
      dongRange: {
        start: makeDongString(apt.startComplexNumber, apt.startDongNumber),
        end: makeDongString(apt.endComplexNumber, apt.endDongNumber),
      },
      hoRange: {
        start: makeHoString(apt.startFloorNumber, apt.startHoNumber),
        end: makeHoString(apt.endFloorNumber, apt.endHoNumber),
      },
    };
  });
};

export const aptDetailDto = (apt: aptDtoType) => {
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
    adminId: apt.users[0].id,
    adminName: apt.users[0].name,
    adminEmail: apt.users[0].email,
    adminContact: apt.users[0].phoneNumber,
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
