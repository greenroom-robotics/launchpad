import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Data,
  DataSearch,
  DataSummary,
  DataTable,
  Select,
  Text,
  Tip,
  Toolbar,
} from 'grommet';
import { CircleInformation } from 'grommet-icons';
import { CollapsiblePanel } from '@greenroom-robotics/alpha.ui/build/components';
import { detectPlatform, PLATFORM_LABELS, platforms, type Platform } from '../data/gamepads';
import { ConnectedGamepadsPanel } from '../components/ConnectedGamepadsPanel';

// Explicit entries in Chromium's mapping tables are certain; the rest are inferred
// from XInput device lists and are only likely to be standard-mapped.
const SOURCE_EXPLANATIONS: Record<string, string> = {
  'mapping-table': 'Recognised as a standard gamepad on this platform.',
  'xinput-fallback':
    'Known Xbox 360 / Xbox One (XInput) device. Treated as a standard gamepad on Linux.',
  'xinput-id-list':
    'Flagged as an XInput device. Windows exposes these through XInput / Windows.Gaming.Input with the standard layout.',
};

interface TableRow {
  id: string;
  name: string;
  vendor: string;
  support: string;
  product: string;
  mapper: string;
  source: string;
}

const DetailLine = ({ label, value }: { label: string; value: string }) =>
  value ? (
    <Text size="small">
      <Text size="small" weight="bold">
        {label}:{' '}
      </Text>
      {value}
    </Text>
  ) : null;

const RowInfo = ({ row }: { row: TableRow }) => (
  <Tip
    content={
      <Box gap="xsmall" width={{ max: 'medium' }}>
        <DetailLine label="Support" value={SOURCE_EXPLANATIONS[row.source] ?? row.source} />
        <DetailLine label="VID:PID" value={row.id} />
        <DetailLine label="USB name" value={row.product} />
        <DetailLine label="Mapper" value={row.mapper} />
      </Box>
    }
  >
    <Button
      plain
      a11yTitle={`Details for ${row.name}`}
      icon={<CircleInformation size="medium" />}
    />
  </Tip>
);

const supportLabel = (source: string) => (source === 'mapping-table' ? 'Mapped' : 'Likely');

export const ControllersSettingsPage = () => {
  const [platform, setPlatform] = useState<Platform>(detectPlatform);

  const rows = useMemo(
    () =>
      platforms[platform].map((r) => ({
        id: `${r.vendor_id}:${r.product_id}`,
        name: r.name,
        vendor: r.vendor,
        support: supportLabel(r.source),
        product: r.product,
        mapper: r.mapper,
        source: r.source,
      })),
    [platform]
  );

  return (
    <Box gap="medium" pad={{ bottom: 'medium' }}>
      <CollapsiblePanel label="Connected controllers" defaultOpen>
        <ConnectedGamepadsPanel />
      </CollapsiblePanel>
      <CollapsiblePanel label="Supported controllers" defaultOpen>
        <Box gap="small">
          <Text size="small" color="text-weak">
            Controllers recognised with the standard gamepad layout on this platform. GAMA supports
            additional controllers, see the GAMA documentation for the full list.
          </Text>
          <Box direction="row" align="center" gap="small">
            <Text size="small">Platform</Text>
            <Select
              size="small"
              options={Object.keys(PLATFORM_LABELS)}
              value={platform}
              labelKey={(key: Platform) => PLATFORM_LABELS[key]}
              onChange={({ option }) => setPlatform(option as Platform)}
            />
          </Box>
          <Data data={rows} key={platform}>
            <Toolbar>
              <DataSearch />
            </Toolbar>
            <DataSummary />
            <Box flex={false} height={{ max: 'large' }} overflow="auto" pad={{ bottom: 'small' }}>
              <DataTable
                primaryKey="id"
                sortable
                columns={[
                  { property: 'name', header: 'Controller' },
                  { property: 'vendor', header: 'Vendor' },
                  { property: 'support', header: 'Support' },
                  {
                    property: 'info',
                    header: '',
                    sortable: false,
                    size: 'xxsmall',
                    render: (row: TableRow) => <RowInfo row={row} />,
                  },
                ]}
              />
            </Box>
          </Data>
        </Box>
      </CollapsiblePanel>
    </Box>
  );
};
