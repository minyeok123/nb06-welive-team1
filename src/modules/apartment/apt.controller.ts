import { Request, Response, NextFunction } from 'express';
import { AptService } from '@modules/apartment/apt.service';
import { AptRepo } from '@modules/apartment/apt.repo';

export class AptController {
  constructor(private aptService: AptService) {}

  getListAptForSignUp = async (req: Request, res: Response, next: NextFunction) => {
    const { keyword, name, address } = req.validatedQuery as unknown as {
      keyword?: string;
      name?: string;
      address?: string;
    };

    const aptList = await this.aptService.getListAptForSignUp(keyword, name, address);
    res.status(200).json(aptList);
  };

  getListApt = async (req: Request, res: Response, next: NextFunction) => {
    const { name, address, searchKeyword, apartmentStatus, page, limit } =
      req.validatedQuery as unknown as {
        name?: string;
        address?: string;
        searchKeyword?: string;
        apartmentStatus?: string;
        page?: number;
        limit?: number;
      };

    const aptList = await this.aptService.getListApt(
      name,
      address,
      searchKeyword,
      apartmentStatus,
      page,
      limit,
    );
    res.status(200).json(aptList);
  };

  getAptDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const aptDetail = await this.aptService.getAptDetail(id);
    res.status(200).json(aptDetail);
  };

  getAptDetailPublic = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const aptDetail = await this.aptService.getAptDetailPublic(id);
    res.status(200).json(aptDetail);
  };
}

const aptRepo = new AptRepo();

const aptService = new AptService(aptRepo);
export const aptController = new AptController(aptService);
