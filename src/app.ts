import express from 'express';
import { defaultNotFoundHandler } from './middlewares/globaErrorHandler';
import { globalErrorHandler } from './middlewares/globaErrorHandler';
import { PORT } from './libs/constants';
import authRouter from './modules/auth/auth.router';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
