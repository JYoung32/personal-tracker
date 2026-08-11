import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { useCollection } from '../../hooks/useCollection';

/**
 * A nav link with a hover dropdown listing items from a collection, so you
 * can jump straight to one (e.g. Garage -> a specific vehicle).
 *
 * Uses a plain CSS :hover reveal (rather than MUI's Menu/Popover) because
 * Menu's modal overlay sits on top of the anchor button once open, which
 * causes the browser to think the mouse has left the button and immediately
 * re-fires enter/leave — a flicker loop. A same-DOM-subtree Paper has no
 * such overlay, so hovering continuously through Button -> Paper is stable.
 */
export function NavDropdownItem({ label, path, collectionKey, getItemLabel, getItemPath, emptyMessage }) {
  const navigate = useNavigate();
  const { items } = useCollection(collectionKey);
  const dropdownClass = `nav-dropdown-${collectionKey}`;

  return (
    <Box
      sx={{
        position: 'relative',
        [`&:hover .${dropdownClass}, &:focus-within .${dropdownClass}`]: {
          display: 'block',
        },
      }}
    >
      <Button component={RouterLink} to={path} color="inherit">
        {label}
      </Button>
      <Paper
        className={dropdownClass}
        elevation={4}
        sx={{
          display: 'none',
          position: 'absolute',
          top: '100%',
          left: 0,
          minWidth: 200,
          zIndex: (theme) => theme.zIndex.appBar + 1,
        }}
      >
        <MenuList dense>
          {items.length === 0 ? (
            <MenuItem disabled>{emptyMessage}</MenuItem>
          ) : (
            items.map((item) => (
              <MenuItem key={item.id} onClick={() => navigate(getItemPath(item))}>
                {getItemLabel(item)}
              </MenuItem>
            ))
          )}
        </MenuList>
      </Paper>
    </Box>
  );
}
