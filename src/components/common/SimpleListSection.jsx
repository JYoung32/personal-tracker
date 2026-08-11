import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import { SingleFieldForm } from './SingleFieldForm';
import { NavigableRowList } from './NavigableRowList';
import { CollapsibleSection } from './CollapsibleSection';
import { AddFormPanel } from './AddFormPanel';

/**
 * A titled, collapsible "add or remove" sub-section (no checkbox) — e.g. a
 * vehicle's Modifications or Wishlist list. A "+" icon in the header
 * toggles the add form; clicking an item (rather than its delete button)
 * opens its full edit view via onItemClick.
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
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <CollapsibleSection
      title={title}
      headerActions={
        <IconButton
          size="small"
          color="primary"
          aria-label={`Add to ${title}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowForm(true);
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <AddFormPanel
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
    </CollapsibleSection>
  );
}
