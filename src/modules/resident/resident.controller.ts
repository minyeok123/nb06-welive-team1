import { Request, Response, NextFunction } from 'express';
import { ResidentService } from './resident.service';
import { ResidentRepo } from './resident.repo';
import { GetRosterListQuery } from '@/types/resident.types';
import {
  getResidentListQuerySchema,
  createRosterFromUserParamsSchema,
  RosterIdParamsSchema,
} from '@modules/resident/resident.validate';

export class ResidentController {
  constructor(private residentService: ResidentService) {}

  getRosterList = async (req: Request, res: Response, next: NextFunction) => {
    const query = getResidentListQuerySchema.parse(req.validatedQuery);

    const rosterList = await this.residentService.getRosterList(req.user.id, query);
    res.status(200).json(rosterList);
  };

  createRoster = async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const roster = await this.residentService.createRoster(req.user, data);
    res.status(201).json(roster);
  };

  createRostersFromCsv = async (req: Request, res: Response, next: NextFunction) => {
    const { id: adminId, aptId } = req.user;
    const file = req.file;
    const result = await this.residentService.createRostersFromCsv(adminId, aptId!, file?.buffer);
    res.status(201).json(result);
  };

  getRosterDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = RosterIdParamsSchema.parse(req.params);
    const roster = await this.residentService.getRosterDetail(id, req.user);
    res.status(200).json(roster);
  };

  patchRoster = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = RosterIdParamsSchema.parse(req.params);
    const data = req.body;
    const roster = await this.residentService.patchRoster(id, data, req.user);
    res.status(200).json(roster);
  };

  softDeleteRoster = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = RosterIdParamsSchema.parse(req.params);
    const roster = await this.residentService.softDeleteRoster(id);
    res.status(200).json({ message: '입주민 정보 삭제 성공' });
  };

  createRosterFromUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = createRosterFromUserParamsSchema.parse(req.params);
    const roster = await this.residentService.createRosterFromUser(userId, req.user);
    res.status(201).json(roster);
  };

  getFileTemplate = async (req: Request, res: Response, next: NextFunction) => {
    const csvHeader = '동,호수,이름,연락처,세대주여부\n';
    const csvRows = '101,101,홍길동,\t01098765432,HOUSEHOLDER\n105,208,김민준,\t01012345678,MEMBER';
    const csvContent = csvHeader + csvRows;
    // 한글 파일명을 안전하게 인코딩
    const fileName = encodeURIComponent('입주민명부_템플릿.csv');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="resident_template.csv"; filename*=UTF-8''${fileName}`,
    );

    // 한글 깨짐 방지를 위한 BOM 추가
    res.status(200).send('\uFEFF' + csvContent);
  };

  getFileRosterList = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user.id;
    const { page, limit, building, unitNumber, residenceStatus, isRegistered, keyword } =
      req.validatedQuery as GetRosterListQuery;

    const csvContent = await this.residentService.getFileRosterList(
      adminId,
      page,
      limit,
      building,
      unitNumber,
      residenceStatus,
      isRegistered,
      keyword,
    );

    const fileName = encodeURIComponent('입주민명부_목록.csv');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="resident_list.csv"; filename*=UTF-8''${fileName}`,
    );

    res.status(200).send('\uFEFF' + csvContent);
  };
}

const residentRepo = new ResidentRepo();
const residentService = new ResidentService(residentRepo);
export const residentController = new ResidentController(residentService);
