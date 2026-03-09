import { Request, Response, NextFunction } from 'express';
import { AptService } from '@modules/apartment/apt.service';
import { AptRepo } from '@modules/apartment/apt.repo';

export class AptController {
  constructor(private aptService: AptService) {}

  getListApt = async (req: Request, res: Response, next: NextFunction) => {
    const { keyword, name, adress } = req.validatedQuery as unknown as {
      keyword?: string;
      name?: string;
      adress?: string;
    };

    const aptList = await this.aptService.getListApt(keyword, name, adress);
    res.status(200).json(aptList);
  };
}

const aptRepo = new AptRepo();

const aptService = new AptService(aptRepo);
export const aptController = new AptController(aptService);
