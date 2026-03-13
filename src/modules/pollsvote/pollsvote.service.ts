import { CustomError } from '@libs/error';
import { PollsvoteRepo } from './pollsvote.repo';

// 투표하기 비즈니스 로직
export class PollsvoteService {
  constructor(private repo: PollsvoteRepo) {}

  voteOption = async (
    optionId: string,
    user: { id: string; aptId: string | null; role: string },
  ) => {
    if (!user?.id) throw new CustomError(403, '접근 권한이 없습니다');

    const resident = await this.repo.findResidentByUserIdForVote(user.id);
    if (!resident) throw new CustomError(403, '입주민만 투표할 수 있습니다');

    const voteOption = await this.repo.findVoteOptionById(optionId);
    if (!voteOption) throw new CustomError(404, '선택지를 찾을 수 없습니다');

    const vote = voteOption.vote;
    if (!vote || vote.deletedAt) throw new CustomError(404, '투표를 찾을 수 없습니다');
    if (vote.board?.aptId !== resident.aptId) throw new CustomError(403, '접근 권한이 없습니다');

    const now = new Date();
    if (now < vote.startDate) throw new CustomError(403, '아직 투표 기간이 시작되지 않았습니다');
    if (now > vote.endDate) throw new CustomError(403, '투표 기간이 종료되었습니다');
    if (vote.status === 'DONE') throw new CustomError(403, '종료된 투표입니다');

    const dongStr = String(resident.dong);
    const isEligible = vote.targetDong.length === 0 || vote.targetDong.includes(dongStr);
    if (!isEligible) throw new CustomError(403, '투표 권한이 없습니다');

    const existing = await this.repo.findParticipationByResidentAndVote(resident.id, vote.id);
    if (existing) throw new CustomError(403, '이미 투표하셨습니다');

    const isOptionInVote = vote.options?.some((o) => o.id === optionId);
    if (!isOptionInVote) throw new CustomError(400, '해당 투표의 선택지가 아닙니다');

    await this.repo.createVoteParticipation(resident.id, vote.id, optionId);

    const voteAfter = await this.repo.findPollById(vote.id);
    const options = (voteAfter?.options ?? []).map((opt) => ({
      id: opt.id,
      title: opt.option,
      votes: opt._count?.participations ?? 0,
    }));

    const updatedOption = options.find((o) => o.id === optionId) ?? {
      id: optionId,
      title: voteOption.option,
      votes: 1,
    };
    const maxVotes = options.length > 0 ? Math.max(...options.map((o) => o.votes)) : 0;
    const winnerOption = options.find((o) => o.votes === maxVotes) ?? updatedOption;

    return {
      message: '투표가 완료되었습니다',
      updatedOption: {
        id: updatedOption.id,
        title: updatedOption.title,
        votes: updatedOption.votes,
      },
      winnerOption: {
        id: winnerOption.id,
        title: winnerOption.title,
        votes: winnerOption.votes,
      },
      options: options.map((o) => ({
        id: o.id,
        title: o.title,
        votes: o.votes,
      })),
    };
  };

  // 투표 취소 (입주민만, 본인이 투표한 선택지만 취소 가능)
  cancelVote = async (
    optionId: string,
    user: { id: string; aptId: string | null; role: string },
  ) => {
    if (!user?.id) throw new CustomError(403, '접근 권한이 없습니다');

    const resident = await this.repo.findResidentByUserIdForVote(user.id);
    if (!resident) throw new CustomError(403, '입주민만 투표를 취소할 수 있습니다');

    const voteOption = await this.repo.findVoteOptionById(optionId);
    if (!voteOption) throw new CustomError(404, '선택지를 찾을 수 없습니다');

    const vote = voteOption.vote;
    if (!vote || vote.deletedAt) throw new CustomError(404, '투표를 찾을 수 없습니다');
    if (vote.board?.aptId !== resident.aptId) throw new CustomError(403, '접근 권한이 없습니다');

    const now = new Date();
    if (now < vote.startDate) throw new CustomError(403, '아직 투표 기간이 시작되지 않았습니다');
    if (now > vote.endDate) throw new CustomError(403, '투표 기간이 종료되었습니다');
    if (vote.status === 'DONE') throw new CustomError(403, '종료된 투표입니다');

    const participation = await this.repo.findParticipationByResidentAndVote(
      resident.id,
      vote.id,
    );
    if (!participation) throw new CustomError(404, '투표한 기록이 없습니다');
    if (participation.voteOptionId !== optionId) {
      throw new CustomError(403, '해당 선택지에 투표한 기록이 없습니다');
    }

    await this.repo.deleteVoteParticipation(resident.id, vote.id);

    const voteAfter = await this.repo.findPollById(vote.id);
    const options = (voteAfter?.options ?? []).map((opt) => ({
      id: opt.id,
      title: opt.option,
      votes: opt._count?.participations ?? 0,
    }));
    const updatedOption = options.find((o) => o.id === optionId) ?? {
      id: optionId,
      title: voteOption.option,
      votes: 0,
    };

    return {
      message: '투표가 취소되었습니다',
      updatedOption: {
        id: updatedOption.id,
        title: updatedOption.title,
        votes: updatedOption.votes,
      },
    };
  };
}
