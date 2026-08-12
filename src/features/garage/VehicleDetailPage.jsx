import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useCollection } from '../../hooks/useCollection';
import { useRecurringReset } from '../../hooks/useRecurringReset';
import { toggleCompletionFields } from '../../utils/recurrence';
import { supportsRecurringDay } from '../../constants/taskOptions';
import { SimpleListSection } from '../../components/common/SimpleListSection';
import { MaintenanceSection } from '../../components/common/MaintenanceSection';
import { RelatedListTabs } from '../../components/common/RelatedListTabs';
import { EditableDetails } from '../../components/common/EditableDetails';
import { BackLink } from '../../components/common/BackLink';
import { VehicleForm } from './VehicleForm';

export function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const {
    items: vehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
    updateItem: updateVehicle,
    removeItem: removeVehicle,
  } = useCollection('garageVehicles');
  const {
    items: modifications,
    loading: modificationsLoading,
    error: modificationsError,
    addItem: addModification,
    removeItem: removeModification,
  } = useCollection('garageModifications');
  const {
    items: todos,
    loading: todosLoading,
    error: todosError,
    addItem: addTodo,
    updateItem: updateTodo,
    removeItem: removeTodo,
  } = useCollection('todos');
  const {
    items: wishlist,
    loading: wishlistLoading,
    error: wishlistError,
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
  } = useCollection('garageWishlist');

  useRecurringReset(todos, todosLoading, updateTodo);

  const vehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId), [vehicles, vehicleId]);
  const vehicleLabel = vehicle
    ? [vehicle.make, vehicle.model, vehicle.trimLevel].filter(Boolean).join(' ')
    : '';
  const vehicleTitle = vehicle ? [vehicle.make, vehicle.model].filter(Boolean).join(' ') : '';
  const vehicleSubtitle = vehicle
    ? [vehicle.trimLevel, vehicle.color].filter(Boolean).join(' · ')
    : '';
  const vehicleModifications = useMemo(
    () => modifications.filter((mod) => mod.vehicleId === vehicleId),
    [modifications, vehicleId]
  );
  const vehicleMaintenanceTasks = useMemo(
    () => todos.filter((t) => t.vehicleId === vehicleId),
    [todos, vehicleId]
  );
  const vehicleWishlist = useMemo(
    () => wishlist.filter((item) => item.vehicleId === vehicleId),
    [wishlist, vehicleId]
  );

  function handleAddMaintenanceTask({ text, frequency, recurringDay }) {
    addTodo({
      text,
      description: null,
      completed: false,
      completedDate: null,
      dueDate: null,
      frequency,
      recurringDay,
      priority: 'medium',
      vehicleId,
      sourceLabel: vehicleLabel,
    });
  }

  function handleToggleMaintenanceComplete(id, completed) {
    updateTodo(id, toggleCompletionFields(completed));
  }

  function handleMaintenanceFrequencyChange(id, frequency) {
    updateTodo(id, { frequency, ...(supportsRecurringDay(frequency) ? {} : { recurringDay: null }) });
  }

  function handleMaintenanceRecurringDayChange(id, recurringDay) {
    updateTodo(id, { recurringDay });
  }

  // ConfirmDeleteButton (via EditableDetails) awaits this and only closes
  // its dialog on success — no local try/catch needed here.
  async function handleDeleteVehicle() {
    await removeVehicle(vehicleId);
    navigate('/garage');
  }

  const loading = vehiclesLoading || modificationsLoading || todosLoading || wishlistLoading;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to="/garage" label="Garage" />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !vehicle ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Vehicle not found.
        </Typography>
      ) : (
        <>
          <EditableDetails
            FormComponent={VehicleForm}
            values={vehicle}
            onSave={(values) => updateVehicle(vehicleId, values)}
            onDelete={handleDeleteVehicle}
            deleteLabel={vehicleLabel}
            error={vehiclesError}
          >
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              {vehicleTitle}
            </Typography>
            {vehicleSubtitle && (
              <Typography variant="body2" color="text.secondary" align="center">
                {vehicleSubtitle}
              </Typography>
            )}
          </EditableDetails>

          <RelatedListTabs
            defaultValue="maintenance"
            tabs={[
              {
                value: 'maintenance',
                label: 'Maintenance',
                content: (
                  <MaintenanceSection
                    emptyMessage="No maintenance tasks added yet."
                    items={vehicleMaintenanceTasks}
                    error={todosError}
                    onAdd={handleAddMaintenanceTask}
                    onToggleComplete={handleToggleMaintenanceComplete}
                    onFrequencyChange={handleMaintenanceFrequencyChange}
                    onRecurringDayChange={handleMaintenanceRecurringDayChange}
                    onDelete={removeTodo}
                  />
                ),
              },
              {
                value: 'modifications',
                label: 'Modifications',
                content: (
                  <SimpleListSection
                    title="Modifications"
                    placeholder="Add a modification"
                    emptyMessage="No modifications added yet."
                    items={vehicleModifications}
                    error={modificationsError}
                    onAdd={(text) => addModification({ text, vehicleId })}
                    onItemClick={(mod) => navigate(`/garage/${vehicleId}/modifications/${mod.id}`)}
                    onDelete={removeModification}
                  />
                ),
              },
              {
                value: 'wishlist',
                label: 'Wishlist',
                content: (
                  <SimpleListSection
                    title="Wishlist"
                    placeholder="Add a wishlist item"
                    emptyMessage="Nothing on the wishlist yet."
                    items={vehicleWishlist}
                    error={wishlistError}
                    onAdd={(text) => addWishlistItem({ text, vehicleId })}
                    onItemClick={(item) => navigate(`/garage/${vehicleId}/wishlist/${item.id}`)}
                    onDelete={removeWishlistItem}
                  />
                ),
              },
            ]}
          />
        </>
      )}
    </Container>
  );
}
