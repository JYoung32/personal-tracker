import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { SingleFieldForm } from '../../components/common/SingleFieldForm';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { BackLink } from '../../components/common/BackLink';

/**
 * Shows the lists within a hobby item (e.g. for a car: Maintenance,
 * Modifications, Parts, Tasks, ...). Each list is itself a container —
 * clicking it drills into HobbyListDetailPage, where the actual checklist
 * entries live.
 */
export function HobbyItemDetailPage() {
  const { hobbyId, itemId } = useParams();
  const navigate = useNavigate();
  const { items: hobbyItems, loading: hobbyItemsLoading } = useCollection('hobbyItems');
  const {
    items: hobbyLists,
    loading: listsLoading,
    error,
    addItem,
    removeItem,
  } = useCollection('hobbyLists');

  const hobbyItem = useMemo(() => hobbyItems.find((i) => i.id === itemId), [hobbyItems, itemId]);
  const lists = useMemo(
    () => hobbyLists.filter((list) => list.hobbyItemId === itemId),
    [hobbyLists, itemId]
  );

  const loading = hobbyItemsLoading || listsLoading;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to={`/hobbies/${hobbyId}`} label="Back" />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !hobbyItem ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Item not found.
        </Typography>
      ) : (
        <>
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              {hobbyItem.name}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <SingleFieldForm
            placeholder="Add a list, e.g. Maintenance"
            onSubmit={(name) => addItem({ name, hobbyItemId: itemId })}
          />

          <NavigableRowList
            items={lists}
            getLabel={(list) => list.name}
            onItemClick={(list) => navigate(`/hobbies/${hobbyId}/items/${itemId}/lists/${list.id}`)}
            onDelete={removeItem}
            emptyMessage="Nothing here — add a list above."
          />
        </>
      )}
    </Container>
  );
}
