import { prisma } from '@libs/prisma';
import { Status } from '@prisma/client';

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
}
