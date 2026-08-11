import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { HobbyForm } from './HobbyForm';
import { NavigableRowList } from '../../components/common/NavigableRowList';
import { PageHeader } from '../../components/common/PageHeader';
import { AddFormPanel } from '../../components/common/AddFormPanel';

export function HobbiesPage() {
  const { items: hobbies, loading, error, addItem, removeItem } = useCollection('hobbies');
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <PageHeader title="Hobby Tracker" onAddClick={() => setShowForm(true)} addLabel="Add a hobby" />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <AddFormPanel
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={addItem}
        FormComponent={HobbyForm}
      />

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
