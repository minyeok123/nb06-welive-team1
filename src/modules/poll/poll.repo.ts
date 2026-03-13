import { prisma } from '@libs/prisma';
import { Prisma, Status } from '@prisma/client';

// 투표 목록용 타입
export type VoteForList = Prisma.VoteGetPayload<{
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
    targetDong: string[];
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

      // 2. 투표 본문 생성
      const vote = await tx.vote.create({
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
          voteId: vote.id,
          option: opt.title,
        })),
      });

      return { board, vote };
    });
  };

  // 투표 목록 조회 (필터, 페이징)
  findPolls = async (params: {
    where: Prisma.VoteWhereInput;
    skip: number;
    take: number;
  }): Promise<{ items: VoteForList[]; totalCount: number }> => {
    const [items, totalCount] = await prisma.$transaction([
      prisma.vote.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
          board: { select: { aptId: true } },
        },
      }),
      prisma.vote.count({ where: params.where }),
    ]);
    return { items: items as VoteForList[], totalCount };
  };

  // 투표 상세 조회 (선택지 + 투표 수 포함)
  findPollById = async (pollId: string) => {
    return prisma.vote.findFirst({
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

  // 입주민 동 정보 조회 (투표권자 필터용)
  findResidentByUserId = async (userId: string) => {
    return prisma.resident.findFirst({
      where: { userId, deletedAt: null },
      select: { dong: true },
    });
  };
}
