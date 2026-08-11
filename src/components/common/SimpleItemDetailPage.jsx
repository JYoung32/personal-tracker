import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useCollection } from '../../hooks/useCollection';
import { SimpleItemForm } from './SimpleItemForm';
import { BackLink } from './BackLink';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';

/**
 * Full edit view for a single simple-list item (a modification or wishlist
 * entry). Generic over which collection it edits and where "back" goes, so
 * Garage and Armory can each supply their own thin route wrapper.
 */
export function SimpleItemDetailPage({ id, collectionKey, backTo, backLabel, title, notFoundMessage }) {
  const navigate = useNavigate();
  const { items, loading, updateItem, removeItem } = useCollection(collectionKey);

  const item = items.find((i) => i.id === id);

  function handleSave(values) {
    updateItem(id, values);
    navigate(backTo);
  }

  function handleDelete() {
    removeItem(id);
    navigate(backTo);
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to={backTo} label={backLabel} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !item ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          {notFoundMessage}
        </Typography>
      ) : (
        <>
          <Typography variant="h4" fontWeight={500} align="center" gutterBottom sx={{ mb: 5 }}>
            {title}
          </Typography>

          <SimpleItemForm key={id} initialValues={item} onSubmit={handleSave} />

          <Box sx={{ textAlign: 'center' }}>
            <ConfirmDeleteButton
              itemLabel={item.text}
              onConfirm={handleDelete}
              renderTrigger={(open) => (
                <Button color="error" onClick={open}>
                  Delete
                </Button>
              )}
            />
          </Box>
        </>
      )}
    </Container>
  );
}
