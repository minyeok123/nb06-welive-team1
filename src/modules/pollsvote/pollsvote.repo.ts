import { prisma } from '@libs/prisma';

// 투표하기 DB 접근 레이어
export class PollsvoteRepo {
  findResidentByUserIdForVote = async (userId: string) => {
    return prisma.resident.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true, aptId: true, dong: true },
    });
  };

  findVoteOptionById = async (optionId: string) => {
    return prisma.voteOption.findFirst({
      where: { id: optionId, vote: { deletedAt: null } },
      include: {
        vote: {
          include: {
            board: { select: { aptId: true } },
            options: { include: { _count: { select: { participations: true } } } },
          },
        },
      },
    });
  };

  findParticipationByResidentAndVote = async (residentId: string, voteId: string) => {
    return prisma.voteParticipation.findUnique({
      where: { residentId_voteId: { residentId, voteId } },
    });
  };

  createVoteParticipation = async (
    residentId: string,
    voteId: string,
    voteOptionId: string,
  ) => {
    return prisma.voteParticipation.create({
      data: { residentId, voteId, voteOptionId },
    });
  };

  findPollById = async (pollId: string) => {
    return prisma.vote.findFirst({
      where: { id: pollId, deletedAt: null },
      include: {
        options: { include: { _count: { select: { participations: true } } } },
      },
    });
  };
}
