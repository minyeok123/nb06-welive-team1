/** 투표 선택지 경로 파라미터 DTO */
export interface OptionIdParamDto {
  optionId: string;
}

/** 투표 선택지 응답 DTO */
export interface PollsvoteOptionDto {
  id: string;
  title: string;
  votes: number;
}

/** 투표 완료 응답 DTO */
export interface PollsvoteVoteResponseDto {
  message: string;
  updatedOption: PollsvoteOptionDto;
  winnerOption: PollsvoteOptionDto;
  options: PollsvoteOptionDto[];
}

/** 투표 취소 응답 DTO */
export interface PollsvoteCancelResponseDto {
  message: string;
  updatedOption: PollsvoteOptionDto;
}

/**
 * 투표 완료 → 응답 DTO 변환
 */
export const pollsvoteVoteResponseDto = (params: {
  message: string;
  updatedOption: PollsvoteOptionDto;
  winnerOption: PollsvoteOptionDto;
  options: PollsvoteOptionDto[];
}): PollsvoteVoteResponseDto => ({
  message: params.message,
  updatedOption: params.updatedOption,
  winnerOption: params.winnerOption,
  options: params.options,
});

/**
 * 투표 취소 → 응답 DTO 변환
 */
export const pollsvoteCancelResponseDto = (params: {
  message: string;
  updatedOption: PollsvoteOptionDto;
}): PollsvoteCancelResponseDto => ({
  message: params.message,
  updatedOption: params.updatedOption,
});
