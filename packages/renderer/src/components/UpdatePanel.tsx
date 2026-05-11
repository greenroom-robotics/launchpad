import { Box, Text, Button, Anchor } from 'grommet';
import { Loading } from './Loading';
import { useAppUpdates } from '../hooks/useAppUpdates';
import { trpc } from '../trpc-react';

const RELEASES_URL = 'https://github.com/greenroom-robotics/launchpad/releases/latest';

export const UpdatePanel = () => {
  const { state, checkNow, installNow, isWorking } = useAppUpdates();
  const { data: systemInfo } = trpc.system.getSystemInfo.useQuery(undefined, {
    staleTime: Infinity,
  });
  const isLinux = systemInfo?.platform === 'linux';

  if (!state) {
    return <Loading label="Loading…" direction="row" />;
  }

  switch (state.kind) {
    case 'not-available':
      return (
        <Box gap="small" align="start">
          <Text size="small">Current version: {state.currentVersion}</Text>
          <Text size="small" color="text-weak">
            You are running the latest version.
          </Text>
          <Button primary label="Check for updates" onClick={checkNow} disabled={isWorking} />
        </Box>
      );

    case 'checking':
      return <Loading label="Checking for updates…" direction="row" />;

    case 'available':
    case 'downloading':
      return <Loading label={`Downloading update ${state.info.version}…`} direction="row" />;

    case 'downloaded':
      return (
        <Box gap="small" align="start">
          <Text>Update {state.info.version} ready to install.</Text>
          {state.info.releaseNotes && (
            <Box pad={{ vertical: 'xsmall' }}>
              <Text size="small" color="text-weak" style={{ whiteSpace: 'pre-wrap' }}>
                {state.info.releaseNotes}
              </Text>
            </Box>
          )}
          {isLinux ? (
            <Anchor
              href={RELEASES_URL}
              target="_blank"
              rel="noreferrer"
              label="Open releases page"
            />
          ) : (
            <Button primary label="Restart and install" onClick={installNow} disabled={isWorking} />
          )}
        </Box>
      );

    case 'error':
      return (
        <Box gap="small" align="start">
          <Text color="status-critical" size="small">
            Update failed: {state.message}
          </Text>
          <Button primary label="Try again" onClick={checkNow} disabled={isWorking} />
        </Box>
      );

    case 'unsupported':
      return (
        <Box gap="small" align="start">
          <Text size="small">Current version: {state.currentVersion}</Text>
          <Text size="small" color="text-weak">
            {state.reason}
          </Text>
        </Box>
      );

    default: {
      const _exhaustive: never = state;
      void _exhaustive;
      return null;
    }
  }
};
