import { Sidebar as GrommetSidebar, Box } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { Configure, AppsRounded } from 'grommet-icons';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router';
import { BarButtons } from '@greenroom-robotics/alpha.ui/build/components/BarButtons';
import { Logo } from '@greenroom-robotics/alpha.ui/build/components';
import { themeMode } from '@greenroom-robotics/alpha.ui/build/theme/theme.utils';

interface LogoWrapperProps {
  $color: string;
}

const LogoWrapper = styled(Box)<LogoWrapperProps>`
  svg {
    filter: ${(props) =>
      themeMode(props.theme, {
        dark: `drop-shadow(0 2px 5px ${normalizeColor(props.$color, props.theme)})`,
        light: 'none',
      })};
    height: 50px;
  }
  margin-bottom: 15px;
`;

export const Sidebar = () => {
  const location = useLocation();
  const route = location.pathname;

  return (
    <GrommetSidebar
      background={'background-front'}
      color="background"
      style={{ position: 'relative', width: '77px', borderRight: '1px solid background' }}
      flex={false}
    >
      <Box direction="column" align="center" flex>
        <Link to="/" style={{ textDecoration: 'background' }}>
          <LogoWrapper $color="currentColor" background="background-front">
            <Logo />
          </LogoWrapper>
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
