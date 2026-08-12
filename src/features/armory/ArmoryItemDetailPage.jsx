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
import { ArmoryItemForm } from './ArmoryItemForm';

export function ArmoryItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const {
    items,
    loading: itemsLoading,
    updateItem: updateArmoryItem,
    removeItem: removeArmoryItem,
  } = useCollection('armoryItems');
  const {
    items: modifications,
    loading: modificationsLoading,
    error: modificationsError,
    addItem: addModification,
    removeItem: removeModification,
  } = useCollection('armoryModifications');
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
  } = useCollection('armoryWishlist');

  useRecurringReset(todos, todosLoading, updateTodo);

  const item = useMemo(() => items.find((i) => i.id === itemId), [items, itemId]);
  const itemLabel = item ? [item.make, item.model].filter(Boolean).join(' ') : '';
  const itemModifications = useMemo(
    () => modifications.filter((mod) => mod.armoryItemId === itemId),
    [modifications, itemId]
  );
  const itemMaintenanceTasks = useMemo(
    () => todos.filter((t) => t.armoryItemId === itemId),
    [todos, itemId]
  );
  const itemWishlist = useMemo(
    () => wishlist.filter((w) => w.armoryItemId === itemId),
    [wishlist, itemId]
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
      armoryItemId: itemId,
      sourceLabel: itemLabel,
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

  function handleDeleteItem() {
    removeArmoryItem(itemId);
    navigate('/armory');
  }

  const loading = itemsLoading || modificationsLoading || todosLoading || wishlistLoading;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to="/armory" label="Armory" />

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
            FormComponent={ArmoryItemForm}
            values={item}
            onSave={(values) => updateArmoryItem(itemId, values)}
            onDelete={handleDeleteItem}
            deleteLabel={itemLabel}
          >
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              {itemLabel}
            </Typography>
            {item.caliber && (
              <Typography variant="body2" color="text.secondary" align="center">
                {item.caliber}
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
                    items={itemMaintenanceTasks}
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
                    items={itemModifications}
                    error={modificationsError}
                    onAdd={(text) => addModification({ text, armoryItemId: itemId })}
                    onItemClick={(mod) => navigate(`/armory/${itemId}/modifications/${mod.id}`)}
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
                    items={itemWishlist}
                    error={wishlistError}
                    onAdd={(text) => addWishlistItem({ text, armoryItemId: itemId })}
                    onItemClick={(item) => navigate(`/armory/${itemId}/wishlist/${item.id}`)}
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
