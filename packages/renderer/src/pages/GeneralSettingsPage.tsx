import { Box, Text } from 'grommet';
import { CollapsiblePanel } from '@greenroom-robotics/alpha.ui/build/components';
import { ThemeToggleControl } from '@greenroom-robotics/alpha.ui/build/theme/components/ThemeToggleControl';
import { UpdatePanel } from '../components/UpdatePanel';
import { AutoStartPanel } from '../components/AutoStartPanel';

export const GeneralSettingsPage = () => (
  <Box gap="medium">
    <CollapsiblePanel label="System Settings" defaultOpen>
      <AutoStartPanel />
    </CollapsiblePanel>
    <CollapsiblePanel label="Updates" defaultOpen>
      <UpdatePanel />
    </CollapsiblePanel>
    <CollapsiblePanel label="Theme" defaultOpen>
      <Text size="small" margin={{ bottom: 'small' }}>
        Set the visual theme for launchpad
      </Text>
      <ThemeToggleControl />
    </CollapsiblePanel>
  </Box>
);
