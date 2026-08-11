import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import { MaintenanceTaskForm } from './MaintenanceTaskForm';
import { MaintenanceTaskList } from './MaintenanceTaskList';
import { CollapsibleSection } from './CollapsibleSection';
import { AddFormPanel } from './AddFormPanel';

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
