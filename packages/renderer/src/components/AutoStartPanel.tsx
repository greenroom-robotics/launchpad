import { Box, Text, CheckBox } from 'grommet';
import { useAutoStart } from '../hooks/useAutoStart';

export const AutoStartPanel = () => {
  const { state, enable, disable, isWorking } = useAutoStart();

  if (!state) return null;

  switch (state.kind) {
    case 'enabled':
    case 'disabled':
      return (
        <Box direction="row" align="center" gap="small">
          <CheckBox
            checked={state.kind === 'enabled'}
            onChange={(event) => (event.target.checked ? enable() : disable())}
            disabled={isWorking}
          />
          <Text size="small">Open at login</Text>
        </Box>
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
