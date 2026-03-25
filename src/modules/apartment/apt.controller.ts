import { Request, Response, NextFunction } from 'express';
import { AptService } from '@modules/apartment/apt.service';
import { AptRepo } from '@modules/apartment/apt.repo';
import {
  getListAptForSignupQuerySchema,
  getListAptQuerySchema,
  getAptDetailParamSchema,
} from '@modules/apartment/apt.validate';

export class AptController {
  constructor(private aptService: AptService) {}

  getListAptForSignUp = async (req: Request, res: Response, next: NextFunction) => {
    const data = getListAptForSignupQuerySchema.parse(req.validatedQuery);

    const aptList = await this.aptService.getListAptForSignUp(data);
    res.status(200).json(aptList);
  };

  getListApt = async (req: Request, res: Response, next: NextFunction) => {
    const query = getListAptQuerySchema.parse(req.validatedQuery);

    const aptList = await this.aptService.getListApt(query);
    res.status(200).json(aptList);
  };

  getAptDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = getAptDetailParamSchema.parse(req.params);
    const user = req.user;
    const aptDetail = await this.aptService.getAptDetail(id, user);
    res.status(200).json(aptDetail);
  };

  getAptDetailPublic = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = getAptDetailParamSchema.parse(req.params);
    const aptDetail = await this.aptService.getAptDetailPublic(id);
    res.status(200).json(aptDetail);
  };
}

const aptRepo = new AptRepo();

const aptService = new AptService(aptRepo);
export const aptController = new AptController(aptService);
