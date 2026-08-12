import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { MaintenanceTaskForm } from './MaintenanceTaskForm';
import { MaintenanceTaskList } from './MaintenanceTaskList';
import { AddFormPanel } from './AddFormPanel';
import { AddToggleActions } from './AddToggleActions';

/**
 * The "Maintenance" list — shown either as one tab's content within
 * RelatedListTabs (title hidden — the tab label already shows it) or
 * standalone on a page (pass `showHeading` to render `title` above the
 * list, e.g. HobbyDetailPage's "Hobby Tasks"). Unlike SimpleListSection,
 * these tasks are real to-do items (see MaintenanceTaskForm), so each also
 * exposes frequency and recurring-day controls. A "+" icon toggles the add
 * form. Pass defaultFrequency to change the add form's starting frequency.
 */
export function MaintenanceSection({
  title = 'Maintenance',
  emptyMessage,
  items,
  error,
  onAdd,
  onToggleComplete,
  onFrequencyChange,
  onRecurringDayChange,
  onDelete,
  showHeading = false,
  defaultFrequency,
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
        FormComponent={MaintenanceTaskForm}
        formProps={{ defaultFrequency }}
      />

      <MaintenanceTaskList
        items={items}
        onToggleComplete={onToggleComplete}
        onFrequencyChange={onFrequencyChange}
        onRecurringDayChange={onRecurringDayChange}
        onDelete={onDelete}
        emptyMessage={emptyMessage}
      />
    </Box>
  );
}
