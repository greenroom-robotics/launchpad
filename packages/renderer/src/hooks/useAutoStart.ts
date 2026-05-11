import { trpc } from '../trpc-react';

export function useAutoStart() {
  const utils = trpc.useUtils();
  const invalidate = () => utils.system.getAutoStartState.invalidate();

  const stateQuery = trpc.system.getAutoStartState.useQuery();
  const enable = trpc.system.enableAutoStart.useMutation({ onSuccess: invalidate });
  const disable = trpc.system.disableAutoStart.useMutation({ onSuccess: invalidate });

  return {
    state: stateQuery.data,
    enable: () => enable.mutate(),
    disable: () => disable.mutate(),
    isWorking: enable.isPending || disable.isPending,
  };
}
