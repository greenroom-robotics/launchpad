import { Box, Text, Button, Anchor, CheckBox } from 'grommet';
import type { UpdateState } from '@app/shared';
import { Loading } from './Loading';
import { useAppUpdates } from '../hooks/useAppUpdates';
import { trpc } from '../trpc-react';

const RELEASES_URL = 'https://github.com/greenroom-robotics/launchpad/releases';
const releaseUrl = (version: string) => `${RELEASES_URL}/tag/v${version}`;

export const UpdatePanel = () => {
  const {
    state,
    autoCheck,
    setAutoCheck,
    checkNow,
    downloadNow,
    cancelDownload,
    installNow,
    isWorking,
  } = useAppUpdates();
  const { data: systemInfo } = trpc.system.getSystemInfo.useQuery(undefined, {
    staleTime: Infinity,
  });
  const isLinux = systemInfo?.platform === 'linux';

  if (!state) {
    return <Loading label="Loading…" direction="row" />;
  }

  // The version is known locally and must never depend on network state.
  return (
    <Box gap="small" align="start">
      <Text size="small">Current version: {state.currentVersion}</Text>
      <UpdateStatus
        state={state}
        isLinux={isLinux}
        isWorking={isWorking}
        checkNow={checkNow}
        downloadNow={downloadNow}
        cancelDownload={cancelDownload}
        installNow={installNow}
      />
      {state.kind !== 'unsupported' && (
        <Box direction="row" align="center" gap="small" margin={{ top: 'xsmall' }}>
          <CheckBox
            checked={autoCheck ?? false}
            onChange={(event) => setAutoCheck(event.target.checked)}
            disabled={isWorking || autoCheck === undefined}
          />
          <Text size="small">Check for updates automatically at startup</Text>
        </Box>
      )}
    </Box>
  );
};

type UpdateStatusProps = {
  state: UpdateState;
  isLinux: boolean;
  isWorking: boolean;
  checkNow: () => void;
  downloadNow: () => void;
  cancelDownload: () => void;
  installNow: () => void;
};

const UpdateStatus = ({
  state,
  isLinux,
  isWorking,
  checkNow,
  downloadNow,
  cancelDownload,
  installNow,
}: UpdateStatusProps) => {
  switch (state.kind) {
    case 'idle':
      return <Button primary label="Check for updates" onClick={checkNow} disabled={isWorking} />;

    case 'not-available':
      return (
        <>
          <Text size="small" color="text-weak">
            You are running the latest version.
          </Text>
          <Button primary label="Check for updates" onClick={checkNow} disabled={isWorking} />
        </>
      );

    case 'checking':
      return <Loading label="Checking for updates…" direction="row" />;

    case 'available':
      return (
        <>
          <Text>Update {state.info.version} is available.</Text>
          <ReleaseNotesLink version={state.info.version} />
          <Button primary label="Download update" onClick={downloadNow} disabled={isWorking} />
        </>
      );

    case 'downloading':
      return (
        <>
          <Loading
            label={`Downloading update ${state.info.version}… ${state.percent}%`}
            direction="row"
          />
          <Button label="Cancel" onClick={cancelDownload} disabled={isWorking} />
        </>
      );

    case 'downloaded':
      return (
        <>
          <Text>Update {state.info.version} ready to install.</Text>
          <ReleaseNotesLink version={state.info.version} />
          <Button primary label="Restart and install" onClick={installNow} disabled={isWorking} />
          <Text size="small" color="text-weak">
            Installing closes all Launchpad windows.
            {isLinux && ' Your system will ask for an administrator password.'}
          </Text>
        </>
      );

    case 'error':
      return (
        <>
          <Text color="status-critical" size="small">
            {state.message}
          </Text>
          <Button primary label="Try again" onClick={checkNow} disabled={isWorking} />
        </>
      );

    case 'unsupported':
      return (
        <Text size="small" color="text-weak">
          {state.reason}
        </Text>
      );

    default: {
      const _exhaustive: never = state;
      void _exhaustive;
      return null;
    }
  }
};

const ReleaseNotesLink = ({ version }: { version: string }) => (
  <Anchor
    href={releaseUrl(version)}
    target="_blank"
    rel="noreferrer"
    label="View release notes"
    size="small"
  />
);
