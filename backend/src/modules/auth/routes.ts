import { Router } from 'express';
import { login, registerCompany } from './auth.service';

const router = Router();

router.post('/register-company', async function handleRegisterCompany(request, response, next) {
  try {
    const result = await registerCompany(request.body);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async function handleLogin(request, response, next) {
  try {
    const result = await login(request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
