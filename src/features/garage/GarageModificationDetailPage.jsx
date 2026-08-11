import { useParams } from 'react-router-dom';
import { SimpleItemDetailPage } from '../../components/common/SimpleItemDetailPage';

export function GarageModificationDetailPage() {
  const { vehicleId, modId } = useParams();

  return (
    <SimpleItemDetailPage
      id={modId}
      collectionKey="garageModifications"
      backTo={`/garage/${vehicleId}`}
      backLabel="Back"
      title="Edit Modification"
      notFoundMessage="Modification not found."
    />
  );
}
