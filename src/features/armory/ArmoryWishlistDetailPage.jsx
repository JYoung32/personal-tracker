import { useParams } from 'react-router-dom';
import { SimpleItemDetailPage } from '../../components/common/SimpleItemDetailPage';

export function ArmoryWishlistDetailPage() {
  const { itemId, wishId } = useParams();

  return (
    <SimpleItemDetailPage
      id={wishId}
      collectionKey="armoryWishlist"
      backTo={`/armory/${itemId}`}
      backLabel="Back"
      title="Edit Wishlist Item"
      notFoundMessage="Wishlist item not found."
    />
  );
}
