import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { EditableDetails } from '../../components/common/EditableDetails';
import { BackLink } from '../../components/common/BackLink';
import { AddFormPanel } from '../../components/common/AddFormPanel';
import { AddToggleActions } from '../../components/common/AddToggleActions';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { TrackerTypeForm } from './TrackerTypeForm';
import { TrackerItemForm } from './TrackerItemForm';

/**
 * Manage one Tracker: rename/delete the type itself and edit its Fields
 * (the "make/model/trim" equivalent) together via EditableDetails —
 * clicking the pencil opens TrackerTypeForm with the current fields
 * pre-filled as pills (see that form's own docstring for how edits are
 * reconciled back to tracker_fields rows by label) — and manage its Items
 * (TrackerItemForm, the dynamic form driven by the current Fields). Click
 * an item to open its own detail page (TrackerItemDetailPage) for Lists.
 */
export function TrackerTypeDetailPage() {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const {
    items: trackerTypes,
    loading: typesLoading,
    error: typesError,
    updateItem: updateType,
    removeItem: removeType,
  } = useCollection('trackerTypes');
  const {
    items: fields,
    loading: fieldsLoading,
    error: fieldsError,
    addItem: addField,
    updateItem: updateField,
    removeItem: removeField,
  } = useCollection('trackerFields');
  const {
    items: trackerItems,
    loading: itemsLoading,
    error: itemsError,
    addItem: addTrackerItem,
    removeItem: removeTrackerItem,
  } = useCollection('trackerItems');

  const [showItemForm, setShowItemForm] = useState(false);

  const type = useMemo(() => trackerTypes.find((t) => t.id === typeId), [trackerTypes, typeId]);
  const typeFields = useMemo(() => fields.filter((f) => f.trackerTypeId === typeId), [fields, typeId]);
  const typeItems = useMemo(
    () => trackerItems.filter((item) => item.trackerTypeId === typeId),
    [trackerItems, typeId]
  );

  // TrackerTypeForm hands back the full desired field set (pills), not a
  // single add/remove/update — diff it against typeFields by label
  // (case-insensitive, same as normalizeTags) so an untouched label keeps
  // its row (and so its id, and so any item data already keyed by it),
  // while a missing label is removed and a new one is added fresh. A
  // label present in both gets its required/fieldType persisted if either
  // changed — that's what a click on an existing field pill (opening the
  // required/type dialog) actually saves.
  async function handleSaveType({ name, description, itemNameLabel, fieldDefs }) {
    await updateType(typeId, { name, description, itemNameLabel });

    const currentByLabel = new Map(typeFields.map((f) => [f.label.toLowerCase(), f]));
    const nextLabels = new Set(fieldDefs.map((f) => f.label.toLowerCase()));
    const toAdd = fieldDefs.filter((f) => !currentByLabel.has(f.label.toLowerCase()));
    const toRemove = typeFields.filter((f) => !nextLabels.has(f.label.toLowerCase()));
    const toUpdate = fieldDefs
      .map((next) => ({ next, current: currentByLabel.get(next.label.toLowerCase()) }))
      .filter(
        ({ next, current }) =>
          current && (current.required !== next.required || current.fieldType !== next.fieldType)
      );

    await Promise.all([
      ...toAdd.map((f) =>
        addField({ label: f.label, required: f.required, fieldType: f.fieldType, trackerTypeId: typeId })
      ),
      ...toRemove.map((f) => removeField(f.id)),
      ...toUpdate.map(({ next, current }) =>
        updateField(current.id, { required: next.required, fieldType: next.fieldType })
      ),
    ]);
  }

  function handleAddItem(values) {
    addTrackerItem({ ...values, trackerTypeId: typeId });
  }

  // ConfirmDeleteButton (via EditableDetails) awaits this and only closes
  // its dialog on success — no local try/catch needed here.
  async function handleDeleteType() {
    await removeType(typeId);
    navigate('/trackers');
  }

  const loading = typesLoading || fieldsLoading || itemsLoading;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to="/trackers" label="Trackers" />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !type ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Tracker not found.
        </Typography>
      ) : (
        <>
          <EditableDetails
            FormComponent={TrackerTypeForm}
            formProps={{ fields: typeFields }}
            values={type}
            onSave={handleSaveType}
            onDelete={handleDeleteType}
            deleteLabel={type.name}
            error={typesError || fieldsError}
          >
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              {type.name}
            </Typography>
            {type.description && (
              <Typography variant="body2" color="text.secondary" align="center">
                {type.description}
              </Typography>
            )}
          </EditableDetails>

          <Divider sx={{ my: 5 }} />

          {!showItemForm && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <AddToggleActions
                open={false}
                onOpen={() => setShowItemForm(true)}
                addLabel="Add an item"
                size="small"
              />
            </Box>
          )}

          {itemsError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {itemsError}
            </Alert>
          )}

          <AddFormPanel
            open={showItemForm}
            onClose={() => setShowItemForm(false)}
            onSubmit={handleAddItem}
            FormComponent={TrackerItemForm}
            formProps={{ fields: typeFields, itemNameLabel: type.itemNameLabel }}
          />

          <NavigableRowList
            items={typeItems}
            getLabel={(item) => item.title}
            getSecondaryLabel={(item) =>
              typeFields.map((field) => item.fieldValues?.[field.id]).filter(Boolean).join(' · ')
            }
            onItemClick={(item) => navigate(`/trackers/${typeId}/${item.id}`)}
            onDelete={removeTrackerItem}
            emptyMessage="Nothing here — add an item above."
          />
        </>
      )}
    </Container>
  );
}
