import { Status } from '@prisma/client';
import { CustomError } from '@libs/error';
import { PollRepo } from './poll.repo';
import { CreatePollInput } from './poll.validate';

// 투표 비즈니스 로직
export class PollService {
  constructor(private repo: PollRepo) {}

  // 투표 등록 (관리자만 가능)
  createPoll = async (input: CreatePollInput, user: { id: string; aptId: string | null; role: string }) => {
    if (!user?.id) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 관리자(ADMIN, SUPER_ADMIN)만 투표 등록 가능
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      throw new CustomError(403, '관리자만 투표를 등록할 수 있습니다');
    }

    // 아파트 소속 관리자만 등록 가능
    if (!user.aptId) {
      throw new CustomError(403, '아파트에 소속된 관리자만 투표를 등록할 수 있습니다');
    }

    // 투표권자 범위: buildingPermission 0 = 전체, 그 외 = 특정 동
    const targetDong =
      input.buildingPermission === 0 ? [] : [String(input.buildingPermission)];

    const status = (input.status ?? 'IN_PROGRESS') as Status;

    await this.repo.createPoll({
      boardId: input.boardId,
      authorId: user.id,
      aptId: user.aptId,
      title: input.title,
      content: input.content,
      status,
      targetDong,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      options: input.options,
    });

    return { message: '정상적으로 등록 처리되었습니다' };
  };
}
