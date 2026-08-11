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
 * Shows the items within a hobby (e.g. for a "Cars" hobby: each individual
 * car). Each item is itself a container — clicking it drills into
 * HobbyItemDetailPage, where lists (maintenance, mods, parts, ...) live.
 */
export function HobbyDetailPage() {
  const { hobbyId } = useParams();
  const navigate = useNavigate();
  const { items: hobbies, loading: hobbiesLoading } = useCollection('hobbies');
  const {
    items: hobbyItems,
    loading: itemsLoading,
    error,
    addItem,
    removeItem,
  } = useCollection('hobbyItems');

  const hobby = useMemo(() => hobbies.find((h) => h.id === hobbyId), [hobbies, hobbyId]);
  const items = useMemo(
    () => hobbyItems.filter((item) => item.hobbyId === hobbyId),
    [hobbyItems, hobbyId]
  );

  const loading = hobbiesLoading || itemsLoading;

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
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              {hobby.name}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <SingleFieldForm
            placeholder="Add an item"
            onSubmit={(name) => addItem({ name, hobbyId })}
          />

          <NavigableRowList
            items={items}
            getLabel={(item) => item.name}
            onItemClick={(item) => navigate(`/hobbies/${hobbyId}/items/${item.id}`)}
            onDelete={removeItem}
            emptyMessage="Nothing here — add an item above."
          />
        </>
      )}
    </Container>
  );
}
