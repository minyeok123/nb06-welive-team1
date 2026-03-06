import { Status } from '@prisma/client';
import { CustomError } from '@libs/error';
import { ComplaintRepo } from './complaint.repo';
import { CreateComplaintInput } from './complaint.validate';

export class ComplaintService {
  constructor(private repo: ComplaintRepo) {}

  createComplaint = async (
    input: CreateComplaintInput,
    user: { id: string; aptId: string | null },
  ) => {
    if (!user?.id || !user?.aptId) {
      throw new CustomError(403, '접근 권한이 없습니다');
    }

    // 민원 등록과 게시판 생성은 트랜잭션으로 처리
    const { board, complaint } = await this.repo.createComplaintWithBoard({
      authorId: user.id,
      aptId: user.aptId,
      title: input.title,
      content: input.content,
      status: input.status ?? Status.PENDING,
      isPublic: input.isPublic,
      boardId: input.boardId,
    });

    // 동일 아파트 관리자에게 알림 전송
    const admins = await this.repo.findAdminsByApartment(user.aptId);
    await this.repo.createComplaintNotifications({
      boardId: board.id,
      complaintId: complaint.id,
      userIds: admins.map((admin) => admin.id),
      message: `새 민원이 등록되었습니다: ${input.title}`,
    });

    return { message: '정상적으로 등록 처리되었습니다' };
  };
}
