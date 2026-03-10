import { RegisterStatus } from '@prisma/client';

export const aptListDto = (apt: aptListDtoType[]) => {
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
    };
  });
};

type aptListDtoType = {
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
