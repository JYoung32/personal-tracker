import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { MaintenanceTaskForm } from './MaintenanceTaskForm';
import { MaintenanceTaskList } from './MaintenanceTaskList';
import { AddFormPanel } from './AddFormPanel';
import { AddToggleActions } from './AddToggleActions';

/**
 * The "Maintenance" list — shown as one tab's content within
 * RelatedListTabs. Unlike SimpleListSection, these tasks are real to-do
 * items (see MaintenanceTaskForm), so each also exposes frequency and
 * recurring-day controls. A "+" icon toggles the add form.
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
}) {
  const [showForm, setShowForm] = useState(false);
  const panelRef = useRef(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
