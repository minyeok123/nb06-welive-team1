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
      where: { id: optionId, poll: { deletedAt: null } },
      select: {
        id: true,
        voteId: true,
        option: true,
        poll: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            targetDong: true,
            options: {
              select: {
                id: true,
                option: true,
                _count: { select: { participations: true } },
              },
            },
            board: {
              select: { aptId: true },
            },
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

  createVoteParticipation = async (residentId: string, voteId: string, voteOptionId: string) => {
    return prisma.voteParticipation.create({
      data: { residentId, voteId, voteOptionId },
    });
  };

  findPollById = async (pollId: string) => {
    return prisma.poll.findFirst({
      where: { id: pollId, deletedAt: null },
      include: {
        options: { include: { _count: { select: { participations: true } } } },
      },
    });
  };

  // 투표 참여 삭제 (투표 취소)
  deleteVoteParticipation = async (residentId: string, voteId: string) => {
    return prisma.voteParticipation.delete({
      where: { residentId_voteId: { residentId, voteId } },
    });
  };
}
