import { Request, Response, NextFunction } from 'express';
import { ResidentService } from './resident.service';
import { ResidentRepo } from './resident.repo';
import { GetResidentRosterListQuery } from '@/types/resident.types';

export class ResidentController {
  constructor(private residentService: ResidentService) {}

  getResidentList = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user.id;
    const { page, limit, building, unitNumber, residenceStatus, isRegistered, keyword } =
      req.validatedQuery as GetResidentRosterListQuery;

    const rosterList = await this.residentService.getResidentRosterList(
      adminId,
      page,
      limit,
      building,
      unitNumber,
      residenceStatus,
      isRegistered,
      keyword,
    );
    res.status(200).json(rosterList);
  };

  createRoster = async (req: Request, res: Response, next: NextFunction) => {
    const { id: adminId, aptId } = req.user;
    const { building, unitNumber, contact, name, isHouseholder } = req.body;
    const roster = await this.residentService.createRoster({
      data: {
        building,
        unitNumber,
        contact,
        name,
        isHouseholder,
        adminId,
        aptId: aptId!,
      },
    });
    res.status(201).json(roster);
  };

  getRosterDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const roster = await this.residentService.getRosterDetail(id);
    res.status(200).json(roster);
  };

  patchRoster = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const { building, unitNumber, contact, name, isHouseholder } = req.body;
    const roster = await this.residentService.patchRoster({
      data: {
        id,
        building,
        unitNumber,
        contact,
        name,
        isHouseholder,
      },
    });
    res.status(200).json(roster);
  };

  deleteRoster = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const roster = await this.residentService.deleteRoster(id);
    res.status(204).json({ message: '입주민 정보 삭제 성공' });
  };
}

const residentRepo = new ResidentRepo();
const residentService = new ResidentService(residentRepo);
export const residentController = new ResidentController(residentService);
