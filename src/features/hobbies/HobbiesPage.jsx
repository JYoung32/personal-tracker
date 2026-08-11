import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { HobbyForm } from './HobbyForm';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { CollapsibleAddForm } from '../../components/common/CollapsibleAddForm';

export function HobbiesPage() {
  const { items: hobbies, loading, error, addItem, removeItem } = useCollection('hobbies');
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={500} align="center" gutterBottom>
          Hobby Tracker
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <CollapsibleAddForm addLabel="Add a hobby" onAdd={addItem} FormComponent={HobbyForm} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <NavigableRowList
          items={hobbies}
          getLabel={(hobby) => hobby.name}
          onItemClick={(hobby) => navigate(`/hobbies/${hobby.id}`)}
          onDelete={removeItem}
          emptyMessage="Nothing here — add a hobby above."
        />
      )}
    </Container>
  );
}
