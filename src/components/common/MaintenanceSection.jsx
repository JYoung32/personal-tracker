import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { MaintenanceTaskForm } from './MaintenanceTaskForm';
import { MaintenanceTaskList } from './MaintenanceTaskList';
import { CollapsibleSection } from './CollapsibleSection';
import { AddFormPanel } from './AddFormPanel';
import { AddToggleActions } from './AddToggleActions';

/**
 * The collapsible "Maintenance" sub-section on a vehicle/armory-item detail
 * page. Unlike SimpleListSection, these tasks are real to-do items (see
 * MaintenanceTaskForm), so each also exposes frequency and recurring-day
 * controls. A "+" icon in the header toggles the add form.
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
    <CollapsibleSection
      title={title}
      headerActions={
        <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', alignItems: 'center' }}>
          <AddToggleActions
            open={showForm}
            onOpen={() => setShowForm(true)}
            onSave={() => panelRef.current?.submit()}
            onCancel={() => setShowForm(false)}
            addLabel={`Add to ${title}`}
            size="small"
          />
        </Box>
      }
    >
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
    </CollapsibleSection>
  );
}
