interface MaropsHeroBoxSvgProps {
  connected: boolean
  color: {
    connected: string
    disconnected: string
  }
}
export const MaropsHeroBoxSvg = ({ connected, color }: MaropsHeroBoxSvgProps) => (
  <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 3074 1958" style={{ overflow: 'visible' }}>
  <defs>
    <style>{`
      .cls-82, .cls-83, .cls-84, .cls-85, .cls-86, .cls-87, .cls-88, .cls-89 {
        fill: none;
      }

      .cls-83, .cls-84, .cls-85, .cls-86, .cls-87 {
        stroke: ${connected ? color.connected : color.disconnected};
      }

      .cls-83, .cls-86 {
        stroke-width: 8.07px;
      }

      .cls-83, .cls-88 {
        stroke-miterlimit: 10;
      }

      .cls-90 {
        clip-path: url(#marops-clippath-1);
      }

      .cls-91 {
        clip-path: url(#marops-clippath-2);
      }

      .cls-84, .cls-85, .cls-86, .cls-87, .cls-89 {
        stroke-linejoin: round;
      }

      .cls-84, .cls-89 {
        stroke-width: 7.45px;
      }

      .cls-85 {
        stroke-width: 7.44px;
      }

      .cls-87 {
        stroke-width: 8.74px;
      }

      .cls-92 {
        fill: ${connected ? color.connected : color.disconnected};;
        opacity: .17;
      }

      .cls-88 {
        opacity: .67;
        stroke-dasharray: 28.57;
        stroke-width: 8.21px;
      }

      .cls-88, .cls-89 {
        stroke: currentColor;
      }

      .cls-93 {
        clip-path: url(#marops-clippath);
      }
    `}</style>
    <clipPath id="marops-clippath">
      <rect className="cls-82" x="4.31" y="3.61" width="3065.91" height="1945.4"/>
    </clipPath>
    <clipPath id="marops-clippath-1">
      <rect className="cls-82" x="-3519.97" y="4.33" width="3065.91" height="1949.96"/>
    </clipPath>
    <clipPath id="marops-clippath-2">
      <rect className="cls-82" x="-1517.15" y="767.87" width="1063.08" height="1063.08"/>
    </clipPath>
  </defs>
  <rect x="0" y="0" width="3074" height="1958" fill="grey" opacity={"15%"}/>  
  <g>
    <rect className="cls-86" x="4.31" y="4.33" width="3065.91" height="1949.96"/>
    <g className="cls-93">
      <g>
        <path className="cls-92" d="M3063.3,925.4v1382.39s-90.54,60.78-263.77,64.22c-173.23,3.44-603.49,5.84-833.08-46.6-229.6-52.45-866.38,1.38-1220.62,36.82-354.23,35.44-741.13-36.82-741.13-36.82l.76-1389s297.11,3.59,389.69,4.11c92.58.53,492.45-7.01,492.45-7.01l505.29,1.17,620.62-6.12,462.03-15.53,207.6-2.45,380.14,14.82Z"/>
        <g>
          <path className="cls-89" stroke="currentColor" d="M618.79,936.89l-6.15-35.6-11.23-4.19v-102.4h325.58s0-5.52,0,9.42,11.23,14.95,11.23,14.95h14.97v18.69c0,18.69,5.47,16.02,5.47,16.02v14.81h28.21v-15.89h11.23c11.23,0,11.23-22.42,11.23-33.64,14.97,0,12.17-32.9,12.17-32.9,0,0,571.62-.74,656.36,0,84.73.74,91.15-30.64,91.15-30.64,0,0,288.16,0,373.1-7.94,84.94-7.94,117.14-87.75,117.14-87.75h374.42l-170.77,262.75"/>
          <path className="cls-89" stroke="currentColor" d="M612.63,901.28s1727.43,7.01,1868.52-7.71"/>
          <path className="cls-89" stroke="currentColor" d="M601.41,827.94h278.44s4.1,41.57,15.33,41.57h220.5"/>
          <path className="cls-89" stroke="currentColor" d="M632.76,794.69l15.43-33.55-127.24-44.85h-20.84s-13.35-22.4,0-24.28c13.35-1.88,17.09,1.86,35.81,9.33,67.36,14.95,148.86,41.77,148.86,41.77l36.41,51.58"/>
          <line className="cls-89" stroke="currentColor" x1="730.51" y1="738.71" x2="730.51" y2="794.69"/>
          <line className="cls-89" stroke="currentColor" x1="738.53" y1="738.71" x2="738.53" y2="794.69"/>
          <polyline className="cls-89" stroke="currentColor" points="836.27 794.69 827.81 768.61 842.78 727.5 831.56 510.74 809.1 398.62 816.59 379.94 846.52 503.26 856.55 687.68 858.54 724.24 872.72 768.61 866.18 794.69"/>
          <polyline className="cls-89" stroke="currentColor" points="856.55 691.53 927.44 691.53 921.61 724.24 916.58 724.24 858.54 724.24"/>
          <line className="cls-89" stroke="currentColor" x1="915.09" y1="794.69" x2="915.09" y2="724.24"/>
          <polyline className="cls-89" stroke="currentColor" points="927.44 691.53 936.34 723.76 936.34 789.16"/>
          <line className="cls-89" stroke="currentColor" x1="915.09" y1="788.19" x2="1024.28" y2="788.19"/>
          <polyline className="cls-89" stroke="currentColor" points="1153.13 786.02 1153.13 707.89 1153.13 695.14 1681.05 695.14"/>
          <polyline className="cls-89" stroke="currentColor" points="2225.72 707.89 1236.7 707.89 1153.13 707.89"/>
          <line className="cls-89" stroke="currentColor" x1="1235.7" y1="785.95" x2="1235.7" y2="707.89"/>
          <line className="cls-89" stroke="currentColor" x1="1194.54" y1="785.95" x2="1194.54" y2="707.89"/>
          <line className="cls-89" stroke="currentColor" x1="1273.13" y1="785.95" x2="1273.13" y2="707.89"/>
          <line className="cls-89" stroke="currentColor" x1="1347.97" y1="785.95" x2="1347.97" y2="707.89"/>
          <line className="cls-89" stroke="currentColor" x1="1422.82" y1="785.95" x2="1422.82" y2="707.89"/>
          <line className="cls-89" stroke="currentColor" x1="1493.92" y1="785.95" x2="1493.92" y2="707.89"/>
          <line className="cls-89" stroke="currentColor" x1="1647.36" y1="785.95" x2="1647.36" y2="707.89"/>
          <polyline className="cls-89" stroke="currentColor" points="1769 755.53 1153.13 755.53 936.34 755.53"/>
          <polyline className="cls-89" stroke="currentColor" points="1755.99 769.46 1153.13 769.46 936.34 769.46"/>
          <ellipse className="cls-89" stroke="currentColor" cx="1411.61" cy="820.93" rx="7.48" ry="7.47"/>
          <ellipse className="cls-89" stroke="currentColor" cx="1505.17" cy="820.93" rx="7.48" ry="7.47"/>
          <ellipse className="cls-89" stroke="currentColor" cx="1636.15" cy="820.93" rx="7.48" ry="7.47"/>
          <ellipse className="cls-89" stroke="currentColor" cx="1827" cy="820.93" rx="7.48" ry="7.47"/>
          <ellipse className="cls-89" stroke="currentColor" cx="1939.27" cy="820.93" rx="7.48" ry="7.47"/>
          <ellipse className="cls-89" stroke="currentColor" cx="2055.28" cy="820.93" rx="7.48" ry="7.47"/>
          <line className="cls-89" stroke="currentColor" x1="2584.76" y1="659.84" x2="2584.76" y2="447.21"/>
          <ellipse className="cls-89" stroke="currentColor" cx="2571.72" cy="499.53" rx="11.23" ry="11.21"/>
          <path className="cls-89" stroke="currentColor" d="M1681.05,707.89l8.37-247.58,85.19-9.37,7.48,119.59-13.1,4.5,5.61,44.08,288.16-3.37s41.95-12.51,49.04-36.34c63.22-1.4,147.31,0,147.31,0v80.43"/>
          <polyline className="cls-89" stroke="currentColor" points="1536.01 695.14 1536.01 676.05 2255.58 667.5"/>
          <polyline className="cls-89" stroke="currentColor" points="1689.42 460.31 1681.05 465.98 1666.96 674.49"/>
          <polyline className="cls-89" stroke="currentColor" points="1680.43 475.16 1654.86 477.1 1650.79 674.68"/>
          <polyline className="cls-89" stroke="currentColor" points="1644.46 674.49 1647.37 480.84 1654.86 477.1"/>
          <polyline className="cls-89" stroke="currentColor" points="1850.89 618.23 1850.89 612.97 1850.89 562.71 1818.09 562.71 1818.09 618.61"/>
          <polyline className="cls-89" stroke="currentColor" points="1863.1 618.08 1946.76 529.43 1966.44 529.43 1966.44 521.2 1940.12 521.2 1850.89 612.97"/>
          <polyline className="cls-89" stroke="currentColor" points="1910.38 617.53 1910.38 595.84 1938.98 595.84 1938.98 618.08"/>
          <polyline className="cls-89" stroke="currentColor" points="2110.16 583.6 1960.72 583.6 1970.09 542.52 2234.91 542.52 2234.91 579.41"/>
          <polygon className="cls-89" stroke="currentColor" points="2268.59 529.43 1966.44 529.43 1966.44 510.5 2249.88 492.05 2268.59 529.43"/>
          <polyline className="cls-89" stroke="currentColor" points="2234.91 542.52 2252.92 542.52 2259.12 542.52 2262.86 529.43"/>
          <line className="cls-89" stroke="currentColor" x1="2253.44" y1="579.41" x2="2253.44" y2="542.52"/>
          <line className="cls-89" stroke="currentColor" x1="2185.08" y1="542.52" x2="2185.08" y2="578.8"/>
          <line className="cls-89" stroke="currentColor" x1="2195.11" y1="542.52" x2="2195.11" y2="578.8"/>
          <line className="cls-89" stroke="currentColor" x1="2117.51" y1="542.52" x2="2117.51" y2="579.41"/>
          <line className="cls-89" stroke="currentColor" x1="2056.99" y1="542.52" x2="2056.99" y2="615.82"/>
          <line className="cls-89" stroke="currentColor" x1="1979.02" y1="542.52" x2="1979.02" y2="616.73"/>
          <line className="cls-89" stroke="currentColor" x1="2001.66" y1="542.52" x2="2001.66" y2="583.6"/>
          <line className="cls-89" stroke="currentColor" x1="2030.02" y1="421.05" x2="2030.02" y2="506.18"/>
          <line className="cls-89" stroke="currentColor" x1="2011.31" y1="508" x2="2011.31" y2="421.05"/>
          <ellipse className="cls-89" stroke="currentColor" cx="2020.67" cy="413.57" rx="11.23" ry="11.21"/>
          <polyline className="cls-89" stroke="currentColor" points="1966.44 510.5 1966.44 278.37 1960.72 278.37 1960.72 272.99 1981.74 272.99 1981.74 278.65 1975.33 278.65 1975.33 509.91"/>
          <line className="cls-89" stroke="currentColor" x1="1910.38" y1="371.05" x2="2031.89" y2="371.05"/>
          <line className="cls-89" stroke="currentColor" x1="1913.36" y1="411.53" x2="2009.44" y2="411.53"/>
          <polyline className="cls-89" stroke="currentColor" points="1917.11 411.53 1917.11 371.05 1917.11 348.71"/>
          <polyline className="cls-89" stroke="currentColor" points="2026.49 404 2026.49 371.05 2026.49 346.22"/>
          <line className="cls-89" stroke="currentColor" x1="1999.15" y1="334.84" x2="1999.15" y2="371.05"/>
          <line className="cls-89" stroke="currentColor" x1="1975.33" y1="404" x2="2007.85" y2="371.05"/>
          <polyline className="cls-89" stroke="currentColor" points="1931.61 348.71 1931.61 371.05 1966.44 411.53"/>
          <polygon className="cls-89" stroke="currentColor" points="2246.91 455.22 2108.94 455.22 2121.15 467.96 2200.92 467.96 2238.9 457.43 2246.91 455.22"/>
          <line className="cls-89" stroke="currentColor" x1="2240.7" y1="492.05" x2="2240.7" y2="457.43"/>
          <line className="cls-89" stroke="currentColor" x1="2200.92" y1="467.96" x2="2200.92" y2="495.35"/>
          <line className="cls-89" stroke="currentColor" x1="2121.15" y1="467.96" x2="2121.15" y2="500.43"/>
          <line className="cls-89" stroke="currentColor" x1="2108.94" y1="455.22" x2="2108.94" y2="500.43"/>
          <polyline className="cls-89" stroke="currentColor" points="2030.02 481.65 2076.63 481.65 2076.63 503.33"/>
          <polyline className="cls-89" stroke="currentColor" points="2086.69 502.44 2086.69 385.12 2063.04 380.12 2117.5 371.05 2101.1 382.41 2101.1 500.43"/>
          <ellipse className="cls-89" stroke="currentColor" cx="1419.41" cy="391.51" rx="51.04" ry="50.97"/>
          <polygon className="cls-89" stroke="currentColor" points="1356.67 475.16 1356.67 460.31 1356.67 430.45 1536.01 430.45 1536.01 475.16 1356.67 475.16"/>
          <line className="cls-89" stroke="currentColor" x1="1536.01" y1="460.31" x2="1356.67" y2="460.31"/>
          <line className="cls-89" stroke="currentColor" x1="1505.17" y1="204.22" x2="1505.17" y2="460.31"/>
          <line className="cls-89" stroke="currentColor" x1="1397.04" y1="437.33" x2="1395.71" y2="460.31"/>
          <line className="cls-89" stroke="currentColor" x1="1441.78" y1="437.33" x2="1443.44" y2="460.31"/>
          <polyline className="cls-89" stroke="currentColor" points="1395.71 695.14 1395.71 477.1 1476.29 569.64"/>
          <line className="cls-89" stroke="currentColor" x1="1454.56" y1="475.16" x2="1505.17" y2="695.14"/>
          <polyline className="cls-89" stroke="currentColor" points="1395.71 667.5 1476.29 569.64 1395.71 569.64"/>
          <line className="cls-89" stroke="currentColor" x1="1365.66" y1="475.16" x2="1395.71" y2="497.08"/>
          <line className="cls-89" stroke="currentColor" x1="1459.18" y1="495.26" x2="1492.13" y2="475.16"/>
          <line className="cls-89" stroke="currentColor" x1="1153.13" y1="695.14" x2="1073.14" y2="695.14"/>
          <line className="cls-89" stroke="currentColor" x1="936.34" y1="746.92" x2="1153.13" y2="746.92"/>
          <path className="cls-89" stroke="currentColor" d="M1111.37,795.6v9.1c0,10.92-12.36,14.56-12.36,14.56h-64.21v-23.75l76.57.09Z"/>
          <line className="cls-89" stroke="currentColor" x1="1222.94" y1="785.95" x2="1216.32" y2="902.79"/>
          <polyline className="cls-89" stroke="currentColor" points="1678.4 505.23 1688.08 500.06 1777.69 500.06"/>
          <polyline className="cls-89" stroke="currentColor" points="1647.59 515.35 1654.86 511.89 1676.41 511.64"/>
          <polyline className="cls-89" stroke="currentColor" points="1171.36 662.16 1171.36 695.14 1171.36 662.16 1073.14 662.16 1073.14 695.14 1073.14 785.95"/>
          <polyline className="cls-89" stroke="currentColor" points="1275.29 621.39 1372.52 621.39 1372.52 695.14"/>
          <line className="cls-89" stroke="currentColor" x1="1204.96" y1="621.39" x2="1255.94" y2="621.39"/>
          <polyline className="cls-89" stroke="currentColor" points="1203.47 695.14 1198.86 657.26 1189.71 657.26 1187.93 639.06 1203.45 622.96 1222.94 602.74 1268.09 628.26 1268.09 650.84 1276.2 648.94 1280.88 628.14 1230.5 567.4 1182.24 621.39 1169.7 635.42 1163.66 662.16 1163.66 621.39 1182.24 621.39"/>
          <path className="cls-89" stroke="currentColor" d="M529.53,719.31s-12.33,53.03-16.07,67.98c-3.74,14.95,7.48,11.21,7.48,11.21"/>
          <path className="cls-89" stroke="currentColor" d="M545.37,798.92c-9.25.42-5.72-11.63-5.72-11.63l3.86-63.05"/>
          <polyline className="cls-84" points="519.63 796.55 527.84 1110.87 541.53 796.55"/>
          <line className="cls-87" x1="527.84" y1="1108.13" x2="533.01" y2="1556.51"/>
        </g>
        <line className="cls-88" stroke="currentColor" x1="1512.25" y1="941.82" x2="1512.25" y2="1479.55"/>
        <line className="cls-88" stroke="currentColor" x1="528.7" y1="1556.51" x2="1512.25" y2="937.06"/>
        <line className="cls-88" stroke="currentColor" x1="1536.08" y1="941.82" x2="2320.52" y2="1675.97"/>
        <g>
          <path className="cls-87" d="M2645.44,1725.99s-49.02-24.93-96.74-39.29v-62.33s-53.38-.01-53.38-.01v52.45c-56.93-.82-413.44-.07-413.44-.07,0,0-86.89-4.18-96.88,49.12-.2,0-.39,0-.59,0,10.01,53.3,96.9,49.16,96.9,49.16,0,0,358.93.9,414.04.09v7.49s53.37.01,53.37.01v-17.54c47.52-14.37,96.13-39.07,96.13-39.07h.59Z"/>
          <polygon className="cls-87" points="2557.75 1619.38 2547.3 1623.95 2495.32 1623.94 2495.31 1615.68 2552.86 1615.69 2557.75 1619.38"/>
          <line className="cls-87" x1="2498.64" y1="1562.73" x2="2498.65" y2="1615.68"/>
          <polyline className="cls-87" points="2518.66 1614.37 2518.66 1608.62 2535.34 1608.63 2535.34 1615.69"/>
          <line className="cls-87" x1="2527" y1="1593.28" x2="2527" y2="1608.62"/>
          <line className="cls-87" x1="2107.3" y1="1676.69" x2="2107.32" y2="1775.08"/>
          <line className="cls-87" x1="2262.97" y1="1676.72" x2="2262.99" y2="1775.36"/>
          <line className="cls-87" x1="2350.96" y1="1676.43" x2="2350.98" y2="1775.44"/>
          <rect className="cls-87" x="2443.63" y="1704.31" width="46.7" height="46.64" rx="1.34" ry="1.34"/>
          <path className="cls-87" d="M2638.17,1722.42s-5.61-35.19,0-41.63c5.6-6.43,7.77,36.87,6.69,45.2"/>
          <path className="cls-87" d="M2637.38,1729.3s-5.59,35.19,0,41.63c5.6,6.44,7.75-36.87,6.67-45.2"/>
          <ellipse className="cls-87" cx="2652.11" cy="1725.99" rx="5" ry="5" transform="translate(553.1 4093.89) rotate(-81.5)"/>
          <rect className="cls-87" x="2130.1" y="1747.56" width="113.41" height="26.65"/>
        </g>
        <g>
          <path className="cls-87" d="M1848.43,1528.57s-49.02-24.92-96.73-39.27v-62.33h-53.37v52.45c-56.94-.81-413.47.01-413.47.01,0,0-86.89-4.16-96.9,49.14h-.59c10,53.3,96.9,49.14,96.9,49.14,0,0,358.94.83,414.05,0v7.49h53.37v-17.54c47.53-14.38,96.15-39.09,96.15-39.09h.59Z"/>
          <polygon className="cls-87" points="1760.77 1421.97 1750.31 1426.55 1698.32 1426.55 1698.32 1418.29 1755.87 1418.29 1760.77 1421.97"/>
          <line className="cls-87" x1="1701.66" y1="1365.34" x2="1701.66" y2="1418.29"/>
          <polyline className="cls-87" points="1721.67 1416.98 1721.67 1411.23 1738.35 1411.23 1738.35 1418.29"/>
          <line className="cls-87" x1="1730.01" y1="1395.89" x2="1730.01" y2="1411.23"/>
          <line className="cls-87" x1="1310.28" y1="1479.38" x2="1310.28" y2="1577.77"/>
          <line className="cls-87" x1="1465.96" y1="1479.38" x2="1465.96" y2="1578.02"/>
          <line className="cls-87" x1="1553.96" y1="1479.07" x2="1553.96" y2="1578.08"/>
          <rect className="cls-87" x="1646.62" y="1506.92" width="46.7" height="46.64" rx="1.34" ry="1.34"/>
          <path className="cls-87" d="M1841.16,1525s-5.6-35.19,0-41.63c5.6-6.43,7.76,36.87,6.68,45.2"/>
          <path className="cls-87" d="M1840.37,1531.88s-5.6,35.19,0,41.63c5.6,6.43,7.76-36.87,6.68-45.2"/>
          <ellipse className="cls-87" cx="1855.1" cy="1528.57" rx="5" ry="5"/>
          <rect className="cls-87" x="1333.07" y="1550.22" width="113.41" height="26.65"/>
        </g>
        <g>
          <polygon className="cls-87" points="413.89 1580.12 413.89 1781.74 609.33 1814.34 664.06 1728.46 664.06 1682.86 648.42 1712.84 648.42 1572.31 468.61 1556.7 413.89 1580.12"/>
          <polyline className="cls-87" points="413.89 1580.12 609.33 1603.54 648.42 1572.31"/>
          <line className="cls-87" x1="609.33" y1="1603.54" x2="609.33" y2="1814.34"/>
          <line className="cls-87" x1="664.06" y1="1682.86" x2="648.42" y2="1680.33"/>
          <line className="cls-87" x1="648.42" y1="1712.84" x2="648.42" y2="1752.99"/>
          <polyline className="cls-87" points="413.89 1692.35 609.33 1720.27 648.42 1667.09"/>
          <polyline className="cls-87" points="479.03 1792.61 479.03 1587.93 524.09 1561.51"/>
          <polyline className="cls-87" points="582.72 1566.11 547.09 1596.08 547.09 1803.96"/>
        </g>
        <path className="cls-85" d="M5.47,935.29c107.73,16.27,848.85-6.51,965.33,0,116.48,6.51,988.8-4.7,1093.44-7.23,72.71-1.76,244.67-3.4,396.28-7.85,66.59-1.96,135.96-10.04,179.95-9.49,144.14,1.8,425.23,15.21,425.23,15.21"/>
      </g>
    </g>
  </g>
  <g className="cls-90">
    <g className="cls-91">
      <polyline className="cls-85" points="-356.49 1716.43 32.09 1582.06 32.09 1037.42 -356.49 1176.93"/>
      <polyline className="cls-85" points="-1340.22 986.44 -953.48 845.91 32.09 1037.42"/>
    </g>
  </g>
  <rect className="cls-83" x="4" y="4.33" width="3065.91" height="1949.96"/>
</svg>
);
