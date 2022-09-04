import express from 'express';
import { getDialogs } from '@controllers/dialog/getDialogs';
import { getDialog } from '@controllers/dialog/getDialog';
import { DIALOG_ROUTES } from '@/types/backendAndFrontendCommonTypes/routes';
import { verifyToken } from '@/middleware/auth';

const dialogRouter = express.Router();
dialogRouter.get(DIALOG_ROUTES.GET_DIALOGS, verifyToken, getDialogs);
dialogRouter.get(DIALOG_ROUTES.GET_BY_ID, verifyToken, getDialog);

export { dialogRouter };
