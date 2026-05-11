import { memo } from 'react';
import { Route, Routes, useLocation, Navigate, useNavigate } from 'react-router';
import { Box } from 'grommet';
import { DetailedSidebar } from '@greenroom-robotics/alpha.ui/build/components/DetailedSidebar';
import { Header } from '../components/layout/Header';
import { AppSettingsPage } from './AppSettingsPage';
import { AuthSettingsPage } from './AuthSettingsPage';
import { GeneralSettingsPage } from './GeneralSettingsPage';

export const SettingsPage = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box fill>
      <Header title="Launchpad - Settings" border={{ side: 'bottom', size: '1px' }} />
      <Box fill direction="row">
        <DetailedSidebar
          items={[{
            id: 'settings',
            label: 'Settings',
            items: [
              { id: '/settings/apps', label: 'Applications' },
              { id: '/settings/auth', label: 'Authentication' },
              { id: '/settings/general', label: 'System' },
            ],
          }]}
          width="220px"
          border="right"
          isItemActive={(itemId) => location.pathname === itemId}
          onItemClick={(item) => {
            if (item.startsWith('http')) {
              window.open(item, '_blank', 'noopener,noreferrer');
            } else {
              navigate(item);
            }
          }}
        />

        <Box fill overflow="auto">
          <Box pad="medium" flex={false}>
            <Routes>
              <Route path="/" element={<Navigate to="apps" replace />} />
              <Route path="apps" element={<AppSettingsPage />} />
              <Route path="auth" element={<AuthSettingsPage />} />
              <Route path="general" element={<GeneralSettingsPage />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

SettingsPage.displayName = 'SettingsPage';
