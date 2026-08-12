import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { SingleFieldForm } from './SingleFieldForm';
import { NavigableRowList } from './NavigableRowList';
import { AddFormPanel } from './AddFormPanel';
import { AddToggleActions } from './AddToggleActions';

/**
 * An "add or remove" list (no checkbox) — e.g. a vehicle's Modifications or
 * Wishlist list. A "+" icon toggles the add form; clicking an item (rather
 * than its delete button) opens its full edit view via onItemClick. Used
 * both as one tab's content within RelatedListTabs (title hidden — the tab
 * label already shows it) and standalone on a page (pass `showHeading` to
 * render `title` above the list).
 */
export function SimpleListSection({
  title,
  placeholder,
  emptyMessage,
  items,
  error,
  onAdd,
  onItemClick,
  onDelete,
  showHeading = false,
}) {
  const [showForm, setShowForm] = useState(false);
  const panelRef = useRef(null);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: showHeading ? 'space-between' : 'flex-end',
          mb: showHeading ? 1 : 0,
        }}
      >
        {showHeading && (
          <Typography variant="h6" fontWeight={500}>
            {title}
          </Typography>
        )}
        <AddToggleActions
          open={showForm}
          onOpen={() => setShowForm(true)}
          onSave={() => panelRef.current?.submit()}
          onCancel={() => setShowForm(false)}
          addLabel={`Add to ${title}`}
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <AddFormPanel
        ref={panelRef}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={onAdd}
        FormComponent={SingleFieldForm}
        formProps={{ placeholder }}
      />

      <NavigableRowList
        items={items}
        getLabel={(item) => item.text}
        getSecondaryLabel={(item) => item.detail}
        onItemClick={onItemClick}
        onDelete={onDelete}
        emptyMessage={emptyMessage}
      />
    </Box>
  );
}
