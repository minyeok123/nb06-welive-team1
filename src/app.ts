import express from 'express';
import { defaultNotFoundHandler } from './middlewares/globaErrorHandler';
import { globalErrorHandler } from './middlewares/globaErrorHandler';
import { PORT } from './libs/constants';
import authRouter from './modules/auth/auth.router';

const app = express();

app.use(express.json());

app.use('/auth', authRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
