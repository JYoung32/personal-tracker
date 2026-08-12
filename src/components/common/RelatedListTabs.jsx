import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

/**
 * A row of tabs (e.g. Maintenance / Modifications / Wishlist on a vehicle
 * or armory-item detail page) where only the selected tab's list — and its
 * own add-to-list control — is rendered. Switching tabs unmounts the
 * previous tab's content, so each list's add form resets when you navigate
 * away from it. `tabs` is `[{ value, label, content }]`; `defaultValue`
 * picks which one shows first.
 */
// Above this many tabs, a centered non-scrolling row risks overflowing a
// narrow phone screen (e.g. a hobby with several user-created lists) — fall
// back to a scrollable row. Below it, keep the centered look.
const SCROLLABLE_THRESHOLD = 4;

export function RelatedListTabs({ tabs, defaultValue }) {
  const [value, setValue] = useState(defaultValue ?? tabs[0]?.value);

  const active = tabs.find((tab) => tab.value === value);
  const scrollable = tabs.length > SCROLLABLE_THRESHOLD;

  return (
    <Box>
      <Tabs
        value={value}
        onChange={(_, next) => setValue(next)}
        centered={!scrollable}
        variant={scrollable ? 'scrollable' : 'standard'}
        scrollButtons={scrollable ? 'auto' : false}
        allowScrollButtonsMobile
        sx={{ minHeight: 36, mb: 3 }}
        slotProps={{ indicator: { sx: { height: 2 } } }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            disableRipple
            sx={{ minHeight: 36, textTransform: 'none', fontSize: 14, px: 1.5 }}
          />
        ))}
      </Tabs>

      {active?.content}
    </Box>
  );
}
