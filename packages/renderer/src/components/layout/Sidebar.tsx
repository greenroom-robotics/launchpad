import { Sidebar as GrommetSidebar, Box } from 'grommet';
import { Configure, AppsRounded } from 'grommet-icons';
import { Link, useLocation } from 'react-router';
import { BarButtons } from '@greenroom-robotics/alpha.ui/build/components/BarButtons';
import { SidebarLogo } from '@greenroom-robotics/alpha.ui/build/components/SidebarLogo';
import { opacity3 } from '@greenroom-robotics/alpha.ui/build/theme/colors';

export const Sidebar = () => {
  const location = useLocation();
  const route = location.pathname;

  return (
    <GrommetSidebar
        background={{ color: 'background', opacity: opacity3 }}
      color="background"
      style={{ position: 'relative', width: '77px' }}
      flex={false}
    >
      <Box direction="column" align="center" flex>
        <Link to="/" style={{ textDecoration: 'background' }}>
          <SidebarLogo />
        </Link>
        <Box flex gap="xsmall">
          <BarButtons
            items={[
              { to: '/', tip: 'Launchpad', icon: <AppsRounded /> },
              {
                to: '/settings',
                tip: 'Settings',
                icon: <Configure />,
                active: route.includes('/settings'),
              },
              // {to:'/installer', tip:"Install", icon: <Install/>, active:route.startsWith('/installer')  }
            ]}
            justify="between"
          />
        </Box>
      </Box>
    </GrommetSidebar>
  );
};
