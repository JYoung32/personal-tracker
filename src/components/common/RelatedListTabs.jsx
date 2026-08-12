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
export function RelatedListTabs({ tabs, defaultValue }) {
  const [value, setValue] = useState(defaultValue ?? tabs[0]?.value);

  const active = tabs.find((tab) => tab.value === value);

  return (
    <Box>
      <Tabs
        value={value}
        onChange={(_, next) => setValue(next)}
        centered
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
