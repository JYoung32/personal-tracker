import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { MaintenanceTaskForm } from './MaintenanceTaskForm';
import { MaintenanceTaskList } from './MaintenanceTaskList';

/**
 * The "Maintenance" sub-section on a vehicle/armory-item detail page.
 * Unlike SimpleListSection, these tasks are real to-do items (see
 * MaintenanceTaskForm), so each also exposes frequency and recurring-day
 * controls.
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
  return (
    <Box>
      <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
        {title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <MaintenanceTaskForm onAdd={onAdd} />

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
