import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { useCollection } from '../../hooks/useCollection';
import { ConfirmDeleteButton } from '../../components/common/ConfirmDeleteButton';
import { TodoForm } from './TodoForm';

/**
 * Full edit view for a single task, reached by clicking any task row
 * (whether a plain to-do or a vehicle/armory maintenance task — both are
 * the same underlying record). Only the fields TodoForm exposes are
 * touched on save; completed/completedDate and any linking fields
 * (vehicleId, armoryItemId, sourceLabel) are left as-is.
 */
export function TaskDetailPage() {
  const { todoId } = useParams();
  const navigate = useNavigate();
  const { items: todos, loading, error, updateItem, removeItem } = useCollection('todos');

  const todo = todos.find((t) => t.id === todoId);

  async function handleSave(values) {
    try {
      await updateItem(todoId, values);
      navigate(-1);
    } catch {
      // error is rendered below; stay on the form so nothing is lost
    }
  }

  // ConfirmDeleteButton awaits this and only closes its dialog on success —
  // no local try/catch needed here.
  async function handleDelete() {
    await removeItem(todoId);
    navigate(-1);
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Button
        onClick={() => navigate(-1)}
        color="inherit"
        startIcon={<ArrowBackIcon fontSize="small" />}
        sx={{ display: 'inline-flex', mb: 4, pl: 0, color: 'text.secondary', fontSize: 14 }}
      >
        Back
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !todo ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Task not found.
        </Typography>
      ) : (
        <>
          <Box sx={{ mb: 5, position: 'relative', textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
              Edit Task
            </Typography>
            {todo.sourceLabel && (
              <Typography variant="body2" color="text.secondary" align="center">
                {todo.sourceLabel}
              </Typography>
            )}
            <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
              <ConfirmDeleteButton
                itemLabel={todo.text}
                onConfirm={handleDelete}
                renderTrigger={(open) => (
                  <IconButton aria-label="Delete" onClick={open} size="small" color="error">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              />
            </Box>
          </Box>

          <TodoForm
            key={todoId}
            initialValues={todo}
            submitLabel="Save"
            onSubmit={handleSave}
            onCancel={() => navigate(-1)}
          />
        </>
      )}
    </Container>
  );
}
