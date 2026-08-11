import { useParams } from 'react-router-dom';
import { SimpleItemDetailPage } from '../../components/common/SimpleItemDetailPage';

export function ArmoryModificationDetailPage() {
  const { itemId, modId } = useParams();

  return (
    <SimpleItemDetailPage
      id={modId}
      collectionKey="armoryModifications"
      backTo={`/armory/${itemId}`}
      backLabel="Back"
      title="Edit Modification"
      notFoundMessage="Modification not found."
    />
  );
}
