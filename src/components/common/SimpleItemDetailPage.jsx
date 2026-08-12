import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
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
  const { items, loading, error, updateItem, removeItem } = useCollection(collectionKey);

  const item = items.find((i) => i.id === id);

  async function handleSave(values) {
    try {
      await updateItem(id, values);
      navigate(backTo);
    } catch {
      // error is rendered below; stay on the form so nothing is lost
    }
  }

  // ConfirmDeleteButton awaits this and only closes its dialog on success —
  // no local try/catch needed here.
  async function handleDelete() {
    await removeItem(id);
    navigate(backTo);
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to={backTo} label={backLabel} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
          <Box sx={{ position: 'relative', mb: 5 }}>
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              {title}
            </Typography>
            <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
              <ConfirmDeleteButton
                itemLabel={item.text}
                onConfirm={handleDelete}
                renderTrigger={(open) => (
                  <IconButton aria-label="Delete" onClick={open} size="small" color="error">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              />
            </Box>
          </Box>

          <SimpleItemForm
            key={id}
            initialValues={item}
            onSubmit={handleSave}
            onCancel={() => navigate(backTo)}
          />
        </>
      )}
    </Container>
  );
}
