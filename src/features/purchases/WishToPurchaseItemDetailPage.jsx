import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { useCollection } from '../../hooks/useCollection';
import { ConfirmDeleteButton } from '../../components/common/ConfirmDeleteButton';
import { BackLink } from '../../components/common/BackLink';
import { WishToPurchaseForm } from './WishToPurchaseForm';

/**
 * Full edit view for a single "Wish to Purchase" item, reached by clicking
 * its row on PurchasesPage.
 */
export function WishToPurchaseItemDetailPage() {
  const { wishId } = useParams();
  const navigate = useNavigate();
  const { items, loading, error, updateItem, removeItem } = useCollection('wishToPurchaseItems');

  const item = items.find((i) => i.id === wishId);

  async function handleSave(values) {
    try {
      await updateItem(wishId, values);
      navigate('/purchases');
    } catch {
      // error is rendered below; stay on the form so nothing is lost
    }
  }

  // ConfirmDeleteButton awaits this and only closes its dialog on success —
  // no local try/catch needed here.
  async function handleDelete() {
    await removeItem(wishId);
    navigate('/purchases');
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <BackLink to="/purchases" label="Finances" />

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
          Item not found.
        </Typography>
      ) : (
        <>
          <Box sx={{ mb: 5, position: 'relative', textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              Edit Wish to Purchase Item
            </Typography>
            <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
              <ConfirmDeleteButton
                itemLabel={item.name}
                onConfirm={handleDelete}
                renderTrigger={(open) => (
                  <IconButton aria-label="Delete" onClick={open} size="small" color="error">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              />
            </Box>
          </Box>

          <WishToPurchaseForm
            key={wishId}
            initialValues={item}
            onSubmit={handleSave}
            onCancel={() => navigate('/purchases')}
          />
        </>
      )}
    </Container>
  );
}
