export type ResidentRosterBody = {
  building: number;
  unitNumber: number;
  contact: string;
  name: string;
  isHouseholder: 'HOUSEHOLDER' | 'MEMBER';
};

export type CreateResidentRosterBody = ResidentRosterBody & { adminId: string; aptId: string };

export type PatchResidentRosterBody = Partial<ResidentRosterBody> & { id: string };

export interface GetResidentRosterListQuery {
  page: number;
  limit: number;
  building?: number;
  unitNumber?: number;
  residenceStatus?: boolean;
  isRegistered?: boolean;
  keyword?: string;
}
