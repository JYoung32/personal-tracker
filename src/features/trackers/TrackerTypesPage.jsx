import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { TrackerTypeForm } from './TrackerTypeForm';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { PageHeader } from '../../components/common/PageHeader';
import { AddFormPanel } from '../../components/common/AddFormPanel';

/**
 * The list of Trackers a user has created — a Tracker is a user-defined
 * domain (e.g. "Guitars"): its own core fields, its own items, each with
 * Maintenance/Modifications/Wishlist lists. Click one to manage its
 * fields and items (TrackerTypeDetailPage).
 */
export function TrackerTypesPage() {
  const { items: trackerTypes, loading, error, addItem, removeItem } = useCollection('trackerTypes');
  const { error: fieldsError, addItem: addField } = useCollection('trackerFields');
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const panelRef = useRef(null);

  // TrackerTypeForm collects the initial Fields as tags up front (see its
  // own docstring), but a field row needs its tracker_type_id, which only
  // exists once the type itself has been created — so create the type
  // first, then fan out one addField per label. Left un-caught: if a field
  // insert fails partway, the type still exists with a partial field set;
  // AddFormPanel's catch keeps the panel open and fieldsError below
  // surfaces why, and the user can add the rest from the detail page.
  async function handleAddType({ name, description, itemNameLabel, fieldDefs }) {
    const type = await addItem({ name, description, itemNameLabel });
    await Promise.all(
      fieldDefs.map((f) =>
        addField({ label: f.label, required: f.required, fieldType: f.fieldType, trackerTypeId: type.id })
      )
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <PageHeader
        title="Trackers"
        isAdding={showForm}
        onAddClick={() => setShowForm(true)}
        onSave={() => panelRef.current?.submit()}
        onCancel={() => setShowForm(false)}
        addLabel="Add a tracker"
      />

      {(error || fieldsError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || fieldsError}
        </Alert>
      )}

      <AddFormPanel
        ref={panelRef}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddType}
        FormComponent={TrackerTypeForm}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <NavigableRowList
          items={trackerTypes}
          getLabel={(type) => type.name}
          onItemClick={(type) => navigate(`/trackers/${type.id}`)}
          onDelete={removeItem}
          emptyMessage="Nothing here — create your first tracker above."
        />
      )}
    </Container>
  );
}
