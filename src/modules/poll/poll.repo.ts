import { prisma } from '@libs/prisma';
import { Prisma, Status } from '@prisma/client';

// 투표 목록용 타입
export type PollForList = Prisma.PollGetPayload<{
  include: {
    author: { select: { id: true; name: true } };
    board: { select: { aptId: true } };
  };
}>;

// 투표 DB 접근 레이어
export class PollRepo {
  // 투표 등록 (게시판 + 투표 + 선택지 트랜잭션)
  createPoll = async (params: {
    boardId: string;
    authorId: string;
    aptId: string;
    title: string;
    content: string;
    status: Status;
    targetDong: number[]; // Int[] 타입에 맞춰 number[]로 수정
    startDate: Date;
    endDate: Date;
    options: { title: string }[];
  }) => {
    return prisma.$transaction(async (tx) => {
      // 1. 투표용 게시판 생성
      const board = await tx.board.create({
        data: {
          id: params.boardId,
          boardType: 'VOTE',
          apartment: { connect: { id: params.aptId } },
        },
      });

      // 2. 투표 본문 생성 (vote -> poll)
      const poll = await tx.poll.create({
        data: {
          boardId: board.id,
          authorId: params.authorId,
          title: params.title,
          content: params.content,
          status: params.status,
          targetDong: params.targetDong,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      });

      // 3. 투표 선택지 일괄 생성
      await tx.voteOption.createMany({
        data: params.options.map((opt) => ({
          voteId: poll.id,
          option: opt.title,
        })),
      });

      return { board, poll };
    });
  };

  // 투표 목록 조회 (필터, 페이징)
  findPolls = async (params: {
    where: Prisma.PollWhereInput;
    skip: number;
    take: number;
  }): Promise<{ items: PollForList[]; totalCount: number }> => {
    const [items, totalCount] = await prisma.$transaction([
      prisma.poll.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
          board: { select: { aptId: true } },
        },
      }),
      prisma.poll.count({ where: params.where }),
    ]);
    return { items: items as PollForList[], totalCount };
  };

  // 투표 상세 조회 (선택지 + 투표 수 포함)
  findPollById = async (pollId: string) => {
    return prisma.poll.findFirst({
      where: { id: pollId, deletedAt: null },
      include: {
        author: { select: { id: true, name: true } },
        board: { select: { aptId: true, boardType: true } },
        options: {
          include: {
            _count: { select: { participations: true } },
          },
        },
      },
    });
  };

  // 투표 수정 (본문 + 선택지)
  updatePoll = async (params: {
    pollId: string;
    title?: string;
    content?: string;
    status?: Status;
    targetDong?: number[];
    startDate?: Date;
    endDate?: Date;
    options?: { title: string }[];
  }) => {
    return prisma.$transaction(async (tx) => {
      const { options, ...pollData } = params;
      const updateData: Record<string, unknown> = {};
      if (pollData.title !== undefined) updateData.title = pollData.title;
      if (pollData.content !== undefined) updateData.content = pollData.content;
      if (pollData.status !== undefined) updateData.status = pollData.status;
      if (pollData.targetDong !== undefined) updateData.targetDong = pollData.targetDong;
      if (pollData.startDate !== undefined) updateData.startDate = pollData.startDate;
      if (pollData.endDate !== undefined) updateData.endDate = pollData.endDate;

      if (Object.keys(updateData).length > 0) {
        await tx.poll.update({
          where: { id: params.pollId },
          data: updateData,
        });
      }

      if (options && options.length > 0) {
        await tx.voteOption.deleteMany({ where: { voteId: params.pollId } });
        await tx.voteOption.createMany({
          data: options.map((opt) => ({
            voteId: params.pollId,
            option: opt.title,
          })),
        });
      }
    });
  };

  // 투표 소프트 삭제 (deletedAt 설정)
  softDeletePoll = async (pollId: string) => {
    await prisma.poll.update({
      where: { id: pollId },
      data: { deletedAt: new Date() },
    });
  };

  // 입주민 동 정보 조회 (투표권자 필터용)
  findResidentByUserId = async (userId: string) => {
    return prisma.resident.findFirst({
      where: { userId, deletedAt: null },
      select: { dong: true },
    });
  };
}
