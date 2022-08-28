import express from 'express';
import { getDialogs } from '@controllers/dialog/getDialogs';
import { getDialog } from '@controllers/dialog/getDialog';

const dialogRouter = express.Router();
dialogRouter.get('/dialogs', getDialogs);
dialogRouter.get('/:dialogId', getDialog);

export { dialogRouter };
