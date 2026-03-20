process.env.NODE_ENV = 'test';

// 테스트 시 console 출력 억제 (dotenv, globalErrorHandler 등)
jest.spyOn(console, 'log').mockImplementation(() => {});
