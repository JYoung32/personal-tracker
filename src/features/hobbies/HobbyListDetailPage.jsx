import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { SingleFieldForm } from '../../components/common/SingleFieldForm';
import { ChecklistRowList } from '../../components/common/ChecklistRowList';
import { BackLink } from '../../components/common/BackLink';

/**
 * The leaf level: the actual checklist entries within one hobby-item list
 * (e.g. everything on a car's "Maintenance" list).
 */
export function HobbyListDetailPage() {
  const { hobbyId, itemId, listId } = useParams();
  const { items: hobbyLists, loading: listsLoading } = useCollection('hobbyLists');
  const {
    items: entries,
    loading: entriesLoading,
    error,
    addItem,
    updateItem,
    removeItem,
  } = useCollection('hobbyListEntries');

  const list = useMemo(() => hobbyLists.find((l) => l.id === listId), [hobbyLists, listId]);
  const listEntries = useMemo(
    () => entries.filter((entry) => entry.hobbyListId === listId),
    [entries, listId]
  );

  function handleToggleComplete(id, completed) {
    updateItem(id, { completed });
  }

  const loading = listsLoading || entriesLoading;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to={`/hobbies/${hobbyId}/items/${itemId}`} label="Back" />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !list ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          List not found.
        </Typography>
      ) : (
        <>
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              {list.name}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <SingleFieldForm
            placeholder="Add an item to this list"
            onSubmit={(text) => addItem({ text, hobbyListId: listId, completed: false })}
          />

          <ChecklistRowList
            items={listEntries}
            getLabel={(entry) => entry.text}
            onToggleComplete={handleToggleComplete}
            onDelete={removeItem}
            emptyMessage="Nothing here — add an item above."
          />
        </>
      )}
    </Container>
  );
}
