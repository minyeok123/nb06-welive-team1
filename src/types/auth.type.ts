import { Role, RegisterStatus } from '@prisma/client';

export interface signupBody {
  username: string;
  name: string;
  email: string;
  contact: string;
  password: string;
  role: Role;
  apartmentName: string;
  apartmentDong: number;
  apartmentHo: number;
}

export interface SuperAdminSignupBody extends Omit<
  signupBody,
  'apartmentDong' | 'apartmentHo' | 'apartmentName'
> {
  joinStatus: 'APPROVED';
}

export interface AdminSignupBody extends Omit<signupBody, 'apartmentDong' | 'apartmentHo'> {
  apartmentAddress: string;
  apartmentManagementNumber: string;
  description: string;
  startComplexNumber: number;
  endComplexNumber: number;
  startDongNumber: number;
  endDongNumber: number;
  startFloorNumber: number;
  endFloorNumber: number;
  startHoNumber: number;
  endHoNumber: number;
}

export interface Register {
  id: string;
  register_status: RegisterStatus;
  aptId: string | null;
  username: string;
  email: string;
  password: string;
  requestedRole: Role;
  phoneNumber: string;
  name: string;
  dong: number | null;
  ho: number | null;
}
