import { useParams } from 'react-router-dom';
import { SimpleItemDetailPage } from '../../components/common/SimpleItemDetailPage';

export function GarageWishlistDetailPage() {
  const { vehicleId, wishId } = useParams();

  return (
    <SimpleItemDetailPage
      id={wishId}
      collectionKey="garageWishlist"
      backTo={`/garage/${vehicleId}`}
      backLabel="Back"
      title="Edit Wishlist Item"
      notFoundMessage="Wishlist item not found."
    />
  );
}
