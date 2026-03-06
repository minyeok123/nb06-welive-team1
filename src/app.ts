import express from 'express';
import { defaultNotFoundHandler } from './middlewares/globaErrorHandler';
import { globalErrorHandler } from './middlewares/globaErrorHandler';
import { PORT } from './libs/constants';
import authRouter from './modules/auth/auth.router';
import cookieParser from 'cookie-parser';
import path from 'path';
import complaintRouter from './modules/complaint/complaint.router';
import userRouter from './modules/user/user.router';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintRouter);
app.use('/api/users', userRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
