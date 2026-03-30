import { RegisterStatus, IsHouseHold } from '@prisma/client';

export type RosterInput = {
  id: string;
  userId: string | null;
  dong: number;
  ho: number;
  name: string;
  phoneNumber: string;
  is_houseHold: IsHouseHold;
  is_registered: boolean;
  is_residence: boolean;
  user: {
    email: string;
    register_status: RegisterStatus;
  } | null;
};

export const rosterListDto = (rosters: RosterInput[], registers: any[] = []) => {
  const mappedRosters = rosters.map((roster) => ({
    id: roster.id,
    userId: roster.userId ?? {},
    building: String(roster.dong),
    unitNumber: String(roster.ho),
    contact: roster.phoneNumber,
    name: roster.name,
    email: roster.user?.email ?? {},
    residenceStatus: roster.is_residence ? 'RESIDENCE' : 'NO_RESIDENCE',
    isHouseholder: roster.is_houseHold,
    isRegistered: roster.is_registered,
    approvalStatus: roster.user?.register_status ?? (roster.is_registered ? 'APPROVED' : 'PENDING'),
  }));

  const mappedRegisters = registers.map((reg) => ({
    id: reg.id,
    userId: {},
    building: String(reg.dong || 0),
    unitNumber: String(reg.ho || 0),
    contact: reg.phoneNumber,
    name: reg.name,
    email: reg.email,
    residenceStatus: 'RESIDENCE',
    isHouseholder: 'MEMBER',
    isRegistered: reg.register_status === 'APPROVED' ? true : false,
    approvalStatus: reg.register_status,
  }));

  return [...mappedRegisters, ...mappedRosters];
};

export const personalRosterDto = (roster: RosterInput) => {
  return {
    id: roster.id,
    userId: roster.userId ?? {},
    building: String(roster.dong),
    unitNumber: String(roster.ho),
    contact: roster.phoneNumber,
    name: roster.name,
    email: roster.user?.email ?? {},
    residenceStatus: roster.is_residence ? 'RESIDENCE' : 'NO_RESIDENCE',
    isHouseholder: roster.is_houseHold,
    isRegistered: roster.is_registered,
    approvalStatus: roster.user?.register_status ?? (roster.is_registered ? 'APPROVED' : 'PENDING'),
  };
};
