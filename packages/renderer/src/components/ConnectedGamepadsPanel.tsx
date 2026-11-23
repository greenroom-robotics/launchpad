import { Box, Text } from 'grommet';
import { useConnectedGamepads, type ConnectedGamepad } from '../hooks/useConnectedGamepads';
import { detectPlatform, findListed, parseGamepadId } from '../data/gamepads';

interface GamepadCompatabilityStatus {
  label: string;
  detail: string;
  color: string;
}

const checkGamepadCompatability = (pad: ConnectedGamepad): GamepadCompatabilityStatus => {
  const ids = parseGamepadId(pad.id);
  const listed = ids ? findListed(detectPlatform(), ids.vendorId, ids.productId) : undefined;

  // The runtime `mapping` is the ground truth; the list is only supporting context.
  if (pad.mapping === 'standard') {
    return {
      label: 'Compatible',
      color: 'status-ok',
      detail: listed
        ? 'Standard mapping, and listed for this platform.'
        : 'Standard mapping, likely managed through a service such as xpad (mappings custom to this system).',
    };
  }
  return {
    label: 'Not standard-mapped',
    color: 'status-warning',
    detail: listed
      ? 'Listed for this platform, but not using the standard layout in this connection (try USB over Bluetooth).'
      : 'Controller is detected, but does not have a layout mapping.',
  };
};

export const ConnectedGamepadsPanel = () => {
  const pads = useConnectedGamepads();

  // If no gamepads are connected
  if (pads.length === 0) {
    return (
      <Text size="small" color="text-weak">
        No controller detected. Connect a controller and press a button on it. This window must be
        focused to see it.
      </Text>
    );
  }

  return (
    <Box gap="small">
      {pads.length > 1 && (
        <Text size="small" color="text-weak">
          GAMA is only compatible with one controller at a time.
        </Text>
      )}
      {pads.map((pad) => {
        const compatability = checkGamepadCompatability(pad);
        return (
          <Box key={pad.index} gap="xsmall" pad="small" round="xsmall" border>
            <Box direction="row" gap="small" align="center">
              <Text weight="bold" color={compatability.color}>
                {compatability.label}
              </Text>
              <Text size="small">{pad.id}</Text>
            </Box>
            <Text size="small" color="text-weak">
              {compatability.detail}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};
