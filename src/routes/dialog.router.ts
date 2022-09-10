import express from 'express';
import { getDialogs } from 'src/controllers/dialog/getDialogs';
import { getDialog } from 'src/controllers/dialog/getDialog';
import { DIALOG_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { verifyToken } from 'src/middleware/auth';

const dialogRouter = express.Router();
// @ts-ignore
dialogRouter.get(DIALOG_ROUTES.GET_DIALOGS, verifyToken, getDialogs);
// @ts-ignore
dialogRouter.get(DIALOG_ROUTES.GET_BY_ID, verifyToken, getDialog);

export { dialogRouter };
