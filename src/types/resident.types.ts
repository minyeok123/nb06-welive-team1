export interface Roster {
  id: string;
  aptId: string;
  adminId: string;
  userId: string;
  dong: number;
  ho: number;
  name: string;
  phoneNumber: string;
  is_houseHold: 'HOUSEHOLDER' | 'MEMBER';
  is_registered: boolean;
  is_residence: boolean;
}

export type CreateRosterFromUser = Pick<
  Roster,
  'dong' | 'ho' | 'name' | 'phoneNumber' | 'adminId' | 'aptId' | 'is_registered'
>;

export type RosterBody = {
  building: number;
  unitNumber: number;
  contact: string;
  name: string;
  isHouseholder: 'HOUSEHOLDER' | 'MEMBER';
};

export type CreateRosterBody = RosterBody & { adminId: string; aptId: string };

export type PatchRosterBody = Partial<RosterBody> & { id: string };

export interface GetRosterListQuery {
  page: number;
  limit: number;
  building?: number;
  unitNumber?: number;
  residenceStatus?: boolean;
  isRegistered?: boolean;
  keyword?: string;
}

export type CsvRosterRecord = {
  동: string;
  호수: string;
  이름: string;
  연락처: string;
  세대주여부: string;
};
