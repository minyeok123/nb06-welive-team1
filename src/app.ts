import express from 'express';
import { defaultNotFoundHandler } from './middlewares/globalErrorHandler';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { PORT } from './libs/constants';
import authRouter from './modules/auth/auth.router';
import cookieParser from 'cookie-parser';
import path from 'path';
import complaintRouter from './modules/complaint/complaint.router';
import pollRouter from './modules/poll/poll.router';
import pollsvoteRouter from './modules/pollsvote/pollsvote.router';
import userRouter from './modules/user/user.router';
import aptRouter from './modules/apartment/apt.router';
import residentRouter from './modules/resident/resident.router';
import noticeRouter from './modules/notice/notice.router';
import commentRouter from './modules/comment/comment.router';
import eventRouter from './modules/event/event.router';
import notificationRouter from './modules/notification/notification.router';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintRouter);
app.use('/api/polls', pollRouter);
app.use('/api/options', pollsvoteRouter);
app.use('/api/users', userRouter);
app.use('/api/apartments', aptRouter);
app.use('/api/residents', residentRouter);
app.use('/api/notices', noticeRouter);
app.use('/api/comments', commentRouter);
app.use('/api/event', eventRouter);
app.use('/api/notifications', notificationRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
