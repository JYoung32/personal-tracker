import { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import { useCollection } from '../../hooks/useCollection';
import { useRecurringReset } from '../../hooks/useRecurringReset';
import { toggleCompletionFields } from '../../utils/recurrence';
import { supportsRecurringDay } from '../../constants/taskOptions';
import { isKnownHobbyListType } from '../../constants/hobbyListTypes';
import { MaintenanceSection } from '../../components/common/MaintenanceSection';
import { SimpleListSection } from '../../components/common/SimpleListSection';
import { RelatedListTabs } from '../../components/common/RelatedListTabs';
import { AddFormPanel } from '../../components/common/AddFormPanel';
import { AddToggleActions } from '../../components/common/AddToggleActions';
import { EditableDetails } from '../../components/common/EditableDetails';
import { BackLink } from '../../components/common/BackLink';
import { HobbyListForm } from './HobbyListForm';
import { HobbyForm } from './HobbyForm';

/**
 * A hobby's main page: a "Hobby Tasks" section (real to-dos, generated
 * directly here — default frequency One-Time, unlike the Daily default
 * elsewhere) plus a row of tabs for whatever Maintenance/Modifications/
 * Wishlist/Equipment lists have been created. Neither section depends on
 * any other sub-entity existing first.
 */
export function HobbyDetailPage() {
  const { hobbyId } = useParams();
  const navigate = useNavigate();
  const {
    items: hobbies,
    loading: hobbiesLoading,
    error: hobbiesError,
    updateItem: updateHobby,
  } = useCollection('hobbies');
  const {
    items: hobbyLists,
    loading: listsLoading,
    error: listsError,
    addItem: addList,
  } = useCollection('hobbyLists');
  const {
    items: entries,
    loading: entriesLoading,
    error: entriesError,
    addItem: addEntry,
    removeItem: removeEntry,
  } = useCollection('hobbyListEntries');
  const {
    items: todos,
    loading: todosLoading,
    error: todosError,
    addItem: addTodo,
    updateItem: updateTodo,
    removeItem: removeTodo,
  } = useCollection('todos');

  const [showListForm, setShowListForm] = useState(false);
  const listPanelRef = useRef(null);

  useRecurringReset(todos, todosLoading, updateTodo);

  const hobby = useMemo(() => hobbies.find((h) => h.id === hobbyId), [hobbies, hobbyId]);
  const lists = useMemo(
    () => hobbyLists.filter((list) => list.hobbyId === hobbyId && isKnownHobbyListType(list.type)),
    [hobbyLists, hobbyId]
  );
  const hobbyTasks = useMemo(
    () => todos.filter((t) => t.hobbyId === hobbyId && !t.hobbyListId),
    [todos, hobbyId]
  );

  function handleAddHobbyTask({ text, frequency, recurringDay }) {
    addTodo({
      text,
      description: null,
      completed: false,
      completedDate: null,
      dueDate: null,
      frequency,
      recurringDay,
      priority: 'medium',
      hobbyId,
      sourceLabel: hobby?.name ?? '',
    });
  }

  function handleToggleTaskComplete(id, completed) {
    updateTodo(id, toggleCompletionFields(completed));
  }

  function handleTaskFrequencyChange(id, frequency) {
    updateTodo(id, { frequency, ...(supportsRecurringDay(frequency) ? {} : { recurringDay: null }) });
  }

  function handleTaskRecurringDayChange(id, recurringDay) {
    updateTodo(id, { recurringDay });
  }

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
        hobbyId,
        hobbyListId: listId,
        sourceLabel: hobby?.name ?? '',
      });
    };
  }

  const loading = hobbiesLoading || listsLoading || entriesLoading || todosLoading;

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
            items={todos.filter((t) => t.hobbyListId === list.id)}
            error={todosError}
            onAdd={handleAddMaintenanceTask(list.id)}
            onToggleComplete={handleToggleTaskComplete}
            onFrequencyChange={handleTaskFrequencyChange}
            onRecurringDayChange={handleTaskRecurringDayChange}
            onDelete={removeTodo}
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
          items={entries.filter((entry) => entry.hobbyListId === list.id)}
          error={entriesError}
          onAdd={(text) => addEntry({ text, detail: null, hobbyListId: list.id })}
          onItemClick={(entry) =>
            navigate(`/hobbies/${hobbyId}/lists/${list.id}/entries/${entry.id}`)
          }
          onDelete={removeEntry}
        />
      ),
    };
  });

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to="/hobbies" label="Hobbies" />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !hobby ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Hobby not found.
        </Typography>
      ) : (
        <>
          <EditableDetails
            FormComponent={HobbyForm}
            values={hobby}
            onSave={(values) => updateHobby(hobbyId, values)}
            error={hobbiesError}
          >
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              {hobby.name}
            </Typography>
            {hobby.description && (
              <Typography variant="body2" color="text.secondary" align="center">
                {hobby.description}
              </Typography>
            )}
          </EditableDetails>

          <MaintenanceSection
            title="Hobby Tasks"
            showHeading
            defaultFrequency="one-time"
            emptyMessage="Nothing here yet — add a task above."
            items={hobbyTasks}
            error={todosError}
            onAdd={handleAddHobbyTask}
            onToggleComplete={handleToggleTaskComplete}
            onFrequencyChange={handleTaskFrequencyChange}
            onRecurringDayChange={handleTaskRecurringDayChange}
            onDelete={removeTodo}
          />

          <Divider sx={{ my: 5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" fontWeight={500}>
              Lists
            </Typography>
            <AddToggleActions
              open={showListForm}
              onOpen={() => setShowListForm(true)}
              onSave={() => listPanelRef.current?.submit()}
              onCancel={() => setShowListForm(false)}
              addLabel="Add a list"
              size="small"
            />
          </Box>

          {listsError && (
            <Typography color="error" align="center" sx={{ mb: 3 }}>
              {listsError}
            </Typography>
          )}

          <AddFormPanel
            ref={listPanelRef}
            open={showListForm}
            onClose={() => setShowListForm(false)}
            onSubmit={(values) => addList({ ...values, hobbyId })}
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
