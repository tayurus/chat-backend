export function getAllDialogParticipantsExceptCurrentUser(participantsIds: string[], currentUserId: string) {
  if (participantsIds.length <= 2) {
    return participantsIds.filter(it => it.toString() !== currentUserId)[0];
  }

  // TODO: предусмотреть, что участников диалога может быть несколько
  return '';
}
