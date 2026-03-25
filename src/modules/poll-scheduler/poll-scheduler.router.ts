import express from 'express';

import { isPollSchedulerHealthy } from './poll-scheduler.service';

const router = express.Router();

/**
 * GET /api/poll-scheduler/ping
 * 스케줄러 프로세스가 떠 있고 최근 틱이 성공했는지 확인 (개발·운영용, 프론트 미사용)
 */
router.get('/ping', (_req, res) => {
  if (!isPollSchedulerHealthy()) {
    return res.status(503).json({
      message: 'Poll scheduler is not running or last tick failed.',
    });
  }
  return res.status(200).json({ message: 'Poll scheduler is running.' });
});

export default router;
