import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { useRecurringReset } from '../../hooks/useRecurringReset';
import { toggleCompletionFields } from '../../utils/recurrence';
import { isKnownHobbyListType } from '../../constants/hobbyListTypes';
import { EditableDetails } from '../../components/common/EditableDetails';
import { BackLink } from '../../components/common/BackLink';
import { AddFormPanel } from '../../components/common/AddFormPanel';
import { AddToggleActions } from '../../components/common/AddToggleActions';
import { RelatedListTabs } from '../../components/common/RelatedListTabs';
import { MaintenanceSection } from '../../components/common/MaintenanceSection';
import { SimpleListSection } from '../../components/common/SimpleListSection';
import { HobbyListForm } from '../hobbies/HobbyListForm';
import { TrackerItemForm } from './TrackerItemForm';

/**
 * One tracker item's detail page for a user-defined Tracker. Core fields
 * (title + whatever the tracker type currently defines + notes) are
 * edited via EditableDetails + TrackerItemForm, same pencil-to-edit
 * pattern used elsewhere. Lists (Maintenance/Modifications/Wishlist/
 * Equipment) reuse the exact mechanism a Hobby's lists use —
 * HobbyListForm and hobbyListTypes.js have no hobby-specific coupling, so
 * they're reused here as-is rather than duplicated. Maintenance tabs pass
 * `readOnlySchedule` to MaintenanceSection so frequency/day show as plain
 * secondary text in the list (editing them still happens on the task's
 * own detail page) — a Tracker-only variant, Hobbies keeps the inline
 * Select controls.
 */
export function TrackerItemDetailPage() {
  const { typeId, itemId } = useParams();
  const navigate = useNavigate();
  const { items: trackerTypes, loading: typesLoading } = useCollection('trackerTypes');
  const { items: fields, loading: fieldsLoading } = useCollection('trackerFields');
  const {
    items: trackerItems,
    loading: itemsLoading,
    error: itemsError,
    updateItem: updateTrackerItem,
    removeItem: removeTrackerItem,
  } = useCollection('trackerItems');
  const {
    items: itemLists,
    loading: listsLoading,
    error: listsError,
    addItem: addList,
  } = useCollection('trackerItemLists');
  const {
    items: entries,
    loading: entriesLoading,
    error: entriesError,
    addItem: addEntry,
    removeItem: removeEntry,
  } = useCollection('trackerItemListEntries');
  const {
    items: todos,
    loading: todosLoading,
    error: todosError,
    addItem: addTodo,
    updateItem: updateTodo,
    removeItem: removeTodo,
  } = useCollection('todos');

  const [showListForm, setShowListForm] = useState(false);

  useRecurringReset(todos, todosLoading, updateTodo);

  const type = useMemo(() => trackerTypes.find((t) => t.id === typeId), [trackerTypes, typeId]);
  const typeFields = useMemo(() => fields.filter((f) => f.trackerTypeId === typeId), [fields, typeId]);
  const item = useMemo(() => trackerItems.find((i) => i.id === itemId), [trackerItems, itemId]);
  const lists = useMemo(
    () => itemLists.filter((list) => list.trackerItemId === itemId && isKnownHobbyListType(list.type)),
    [itemLists, itemId]
  );

  function handleAddMaintenanceTask(listId) {
    return ({ text, frequency, recurringDay }) => {
      addTodo({
        text,
        description: null,
        completed: false,
        completedDate: null,
        dueDate: null,
        frequency,
        recurringDay,
        priority: 'medium',
        trackerItemId: itemId,
        trackerItemListId: listId,
        sourceLabel: item?.title ?? '',
      });
    };
  }

  function handleToggleTaskComplete(id, completed) {
    updateTodo(id, toggleCompletionFields(completed));
  }

  // ConfirmDeleteButton (via EditableDetails) awaits this and only closes
  // its dialog on success — no local try/catch needed here.
  async function handleDeleteItem() {
    await removeTrackerItem(itemId);
    navigate(`/trackers/${typeId}`);
  }

  const loading = typesLoading || fieldsLoading || itemsLoading || listsLoading || entriesLoading || todosLoading;

  const firstMaintenanceList = lists.find((list) => list.type === 'maintenance');
  const defaultTab = (firstMaintenanceList ?? lists[0])?.id;

  const tabs = lists.map((list) => {
    if (list.type === 'maintenance') {
      return {
        value: list.id,
        label: list.name,
        content: (
          <MaintenanceSection
            title={list.name}
            emptyMessage="No maintenance tasks added yet."
            items={todos.filter((t) => t.trackerItemListId === list.id)}
            error={todosError}
            onAdd={handleAddMaintenanceTask(list.id)}
            onToggleComplete={handleToggleTaskComplete}
            onDelete={removeTodo}
            readOnlySchedule
          />
        ),
      };
    }

    return {
      value: list.id,
      label: list.name,
      content: (
        <SimpleListSection
          title={list.name}
          placeholder={`Add to ${list.name}`}
          emptyMessage="Nothing here yet."
          items={entries.filter((entry) => entry.trackerItemListId === list.id)}
          error={entriesError}
          onAdd={(text) => addEntry({ text, detail: null, trackerItemListId: list.id })}
          onItemClick={(entry) =>
            navigate(`/trackers/${typeId}/${itemId}/lists/${list.id}/entries/${entry.id}`)
          }
          onDelete={removeEntry}
        />
      ),
    };
  });

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to={`/trackers/${typeId}`} label={type?.name ?? 'Tracker'} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !item ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Item not found.
        </Typography>
      ) : (
        <>
          <EditableDetails
            FormComponent={TrackerItemForm}
            formProps={{ fields: typeFields, itemNameLabel: type?.itemNameLabel }}
            values={item}
            onSave={(values) => updateTrackerItem(itemId, values)}
            onDelete={handleDeleteItem}
            deleteLabel={item.title}
            error={itemsError}
          >
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              {item.title}
            </Typography>
            {typeFields.map((field) =>
              item.fieldValues?.[field.id] ? (
                <Typography key={field.id} variant="body2" color="text.secondary" align="center">
                  {field.label}: {item.fieldValues[field.id]}
                </Typography>
              ) : null
            )}
            {item.notes && (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
              >
                {item.notes}
              </Typography>
            )}
          </EditableDetails>

          <Divider sx={{ my: 5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" fontWeight={500}>
              Lists
            </Typography>
            {!showListForm && (
              <AddToggleActions
                open={false}
                onOpen={() => setShowListForm(true)}
                addLabel="Add a list"
                size="small"
              />
            )}
          </Box>

          {listsError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {listsError}
            </Alert>
          )}

          <AddFormPanel
            open={showListForm}
            onClose={() => setShowListForm(false)}
            onSubmit={(values) => addList({ ...values, trackerItemId: itemId })}
            FormComponent={HobbyListForm}
          />

          {tabs.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
              Nothing here — add a list above.
            </Typography>
          ) : (
            <RelatedListTabs tabs={tabs} defaultValue={defaultTab} />
          )}
        </>
      )}
    </Container>
  );
}
