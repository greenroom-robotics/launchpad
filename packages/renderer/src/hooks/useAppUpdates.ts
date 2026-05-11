import { trpc } from '../trpc-react';

export function useAppUpdates() {
  const utils = trpc.useUtils();
  const invalidate = () => utils.update.getState.invalidate();

  const stateQuery = trpc.update.getState.useQuery(undefined, {
    refetchInterval: 2000,
  });

  const checkNow = trpc.update.checkNow.useMutation({ onSuccess: invalidate });
  const installNow = trpc.update.installNow.useMutation({ onSuccess: invalidate });

  return {
    state: stateQuery.data,
    checkNow: () => checkNow.mutate(),
    installNow: () => installNow.mutate(),
    isWorking: checkNow.isPending || installNow.isPending,
  };
}
