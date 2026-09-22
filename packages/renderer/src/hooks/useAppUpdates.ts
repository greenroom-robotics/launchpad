import { trpc } from '../trpc-react';

export function useAppUpdates() {
  const utils = trpc.useUtils();
  const invalidateState = () => utils.update.getState.invalidate();
  const invalidateAutoCheck = () => utils.update.getAutoCheck.invalidate();

  const stateQuery = trpc.update.getState.useQuery(undefined, {
    refetchInterval: 2000,
  });
  const autoCheckQuery = trpc.update.getAutoCheck.useQuery();

  const setAutoCheck = trpc.update.setAutoCheck.useMutation({ onSuccess: invalidateAutoCheck });
  const checkNow = trpc.update.checkNow.useMutation({ onSuccess: invalidateState });
  const downloadNow = trpc.update.downloadNow.useMutation({ onSuccess: invalidateState });
  const cancelDownload = trpc.update.cancelDownload.useMutation({ onSuccess: invalidateState });
  const installNow = trpc.update.installNow.useMutation({ onSuccess: invalidateState });

  return {
    state: stateQuery.data,
    autoCheck: autoCheckQuery.data,
    setAutoCheck: (enabled: boolean) => setAutoCheck.mutate(enabled),
    checkNow: () => checkNow.mutate(),
    downloadNow: () => downloadNow.mutate(),
    cancelDownload: () => cancelDownload.mutate(),
    installNow: () => installNow.mutate(),
    isWorking:
      setAutoCheck.isPending ||
      checkNow.isPending ||
      downloadNow.isPending ||
      cancelDownload.isPending ||
      installNow.isPending,
  };
}
