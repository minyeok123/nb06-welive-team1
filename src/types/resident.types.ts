export interface GetResidentRosterListQuery {
  page: number;
  limit: number;
  building?: number;
  unitNumber?: number;
  residenceStatus?: boolean;
  isRegistered?: boolean;
  keyword?: string;
}
