import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * A titled section whose content can be collapsed by clicking the header —
 * used for the Modifications/Maintenance/Wishlist sub-lists on vehicle and
 * armory-item detail pages, so a page with several sections doesn't force
 * you to scroll past all of them. `headerActions` renders before the
 * collapse chevron (e.g. a "+" icon) — pass an element that stops its own
 * click propagation so it doesn't also toggle the collapse state.
 */
export function CollapsibleSection({ title, defaultExpanded = true, headerActions, children }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box>
      <Box
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          mb: expanded ? 2 : 0,
        }}
      >
        <Typography variant="h6" fontWeight={500}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {headerActions}
          <IconButton
            size="small"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {expanded && children}
    </Box>
  );
}
