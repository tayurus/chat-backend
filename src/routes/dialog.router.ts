import express from 'express';
import { getDialogs } from '@controllers/dialog/getDialogs';
import { getDialog } from '@controllers/dialog/getDialog';
import { DIALOG_ROUTES } from '@/types/backendAndFrontendCommonTypes/routes';

const dialogRouter = express.Router();
dialogRouter.get(DIALOG_ROUTES.GET_DIALOGS, getDialogs);
dialogRouter.get(DIALOG_ROUTES.GET_BY_ID, getDialog);

export { dialogRouter };
