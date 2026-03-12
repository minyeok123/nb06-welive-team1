import { RegisterStatus, IsHouseHold } from '@prisma/client';

export type ResidentRosterInput = {
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

export const residentListDto = (rosters: ResidentRosterInput[]) => {
  return rosters.map((roster) => {
    return {
      id: roster.id,
      userId: roster.userId ?? null,
      building: String(roster.dong),
      unitNumber: String(roster.ho),
      contact: roster.phoneNumber,
      name: roster.name,
      email: roster.user?.email ?? null,
      residenceStatus: roster.is_residence ? 'RESIDENCE' : 'NO_RESIDENCE',
      isHouseholder: roster.is_houseHold,
      isRegistered: roster.is_registered,
      approvalStatus:
        roster.user?.register_status ?? (roster.is_registered ? 'APPROVED' : 'PENDING'),
    };
  });
};
