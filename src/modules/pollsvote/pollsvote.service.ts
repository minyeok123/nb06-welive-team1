import { CustomError } from '@libs/error';
import { pollsvoteVoteResponseDto, pollsvoteCancelResponseDto } from './dto/response.dto';
import { PollsvoteRepo } from './pollsvote.repo';
import { withoutPasswordUser } from '@/types/user.types';

// 투표하기 비즈니스 로직
export class PollsvoteService {
  constructor(private repo: PollsvoteRepo) {}

  voteOption = async (optionId: string, user: withoutPasswordUser) => {
    // 1. 입주민 정보 조회 (투표를 위해 필수)
    const resident = await this.repo.findResidentByUserIdForVote(user.id);
    if (!resident) {
      throw new CustomError(403, '승인된 입주민만 투표할 수 있습니다');
    }

    // 2. 선택지 및 해당 투표 정보 조회
    const voteOption = await this.repo.findVoteOptionById(optionId);
    if (!voteOption) {
      throw new CustomError(404, '투표 또는 선택지를 찾을 수 없습니다');
    }
    const vote = voteOption.poll;

    // 3. 보안 체크: 소속 아파트 게시판이 맞는지 확인
    if (vote.board?.aptId !== user.aptId) {
      throw new CustomError(403, '소속 아파트의 투표가 아닙니다');
    }

    // 4. 시간 및 상태 체크
    const now = new Date();
    if (now < vote.startDate) throw new CustomError(403, '아직 투표 기간이 아닙니다');
    if (now > vote.endDate) throw new CustomError(403, '투표 기간이 끝났습니다');
    if (vote.status === 'DONE') throw new CustomError(403, '이미 종료된 투표입니다');

    // 5. 투표 권한(동) 체크 (0: 전체 동 허용, 그 외: 본인 동만 가능)
    if (vote.targetDong !== 0 && vote.targetDong !== resident.dong) {
      throw new CustomError(403, '본인의 해당 동 투표가 아닙니다');
    }

    // 6. 중복 투표 체크
    const existingParticipation = await this.repo.findParticipationByResidentAndVote(
      resident.id,
      vote.id,
    );
    if (existingParticipation) {
      throw new CustomError(400, '이미 참여하신 투표입니다');
    }

    // 7. 선택지의 유효성 최종 확인 (투표와 선택지가 매칭되는지)
    const isValidOption = vote.options?.some((o) => o.id === optionId);
    if (!isValidOption) {
      throw new CustomError(400, '해당 투표의 올바른 선택지가 아닙니다');
    }

    // 8. 투표 기록 생성
    await this.repo.createVoteParticipation(resident.id, vote.id, optionId);

    // 9. 결과 집계 및 반환
    const voteAfter = await this.repo.findPollById(vote.id);
    const options = (voteAfter?.options ?? []).map((opt) => ({
      id: opt.id,
      title: opt.option,
      votes: opt._count?.participations ?? 0,
    }));

    const updatedOption = options.find((o) => o.id === optionId) || {
      id: optionId,
      title: voteOption.option,
      votes: 1,
    };
    const maxVotes = options.length > 0 ? Math.max(...options.map((o) => o.votes)) : 0;
    const winnerOption = options.find((o) => o.votes === maxVotes) || updatedOption;

    return pollsvoteVoteResponseDto({
      message: '투표가 완료되었습니다',
      updatedOption,
      winnerOption,
      options,
    });
  };

  // 투표 취소 (입주민만, 본인이 투표한 선택지만 취소 가능)
  cancelVote = async (optionId: string, user: withoutPasswordUser) => {
    // 1. 입주민 정보 조회
    const resident = await this.repo.findResidentByUserIdForVote(user.id);
    if (!resident) {
      throw new CustomError(403, '승인된 입주민만 투표를 취소할 수 있습니다');
    }

    // 2. 선택지 및 해당 투표 정보 조회
    const voteOption = await this.repo.findVoteOptionById(optionId);
    if (!voteOption) {
      throw new CustomError(404, '투표 정보를 찾을 수 없습니다');
    }

    const vote = voteOption.poll;

    // 3. 보안 체크: 소속 아파트 게시판이 맞는지 확인
    if (vote.board?.aptId !== user.aptId) {
      throw new CustomError(403, '소속 아파트의 투표가 아닙니다');
    }

    // 4. 기간 및 상태 체크
    const now = new Date();
    if (now < vote.startDate) throw new CustomError(403, '아직 투표 기간이 시작되지 않았습니다');
    if (now > vote.endDate) throw new CustomError(403, '투표 기간이 종료되어 취소할 수 없습니다');
    if (vote.status === 'DONE') throw new CustomError(403, '이미 종료된 투표입니다');

    // 5. 투표 기록 확인
    const participation = await this.repo.findParticipationByResidentAndVote(resident.id, vote.id);
    if (!participation) {
      throw new CustomError(404, '투표한 기록이 없습니다');
    }
    if (participation.voteOptionId !== optionId) {
      throw new CustomError(403, '해당 선택지에 투표한 기록이 없습니다');
    }

    // 6. 투표 취소 실행
    await this.repo.deleteVoteParticipation(resident.id, vote.id);

    // 7. 결과 집계 및 반환
    const voteAfter = await this.repo.findPollById(vote.id);
    const options = (voteAfter?.options ?? []).map((opt) => ({
      id: opt.id,
      title: opt.option,
      votes: opt._count?.participations ?? 0,
    }));

    const updatedOption = options.find((o) => o.id === optionId) || {
      id: optionId,
      title: voteOption.option,
      votes: 0,
    };

    return pollsvoteCancelResponseDto({
      message: '투표가 취소되었습니다',
      updatedOption,
    });
  };
}
