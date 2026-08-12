import Container from '@mui/material/Container';
import { PageHeader } from '../../components/common/PageHeader';
import { RelatedListTabs } from '../../components/common/RelatedListTabs';
import { OweSection } from './OweSection';
import { WishToPurchaseSection } from './WishToPurchaseSection';

/**
 * Finances tab: a row of tabs — Owe (see OweSection) and Wish to Purchase
 * (see WishToPurchaseSection).
 */
export function PurchasesPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <PageHeader title="Finances" />

      <RelatedListTabs
        defaultValue="owe"
        tabs={[
          { value: 'owe', label: 'Owe', content: <OweSection /> },
          { value: 'wish-to-purchase', label: 'Wish to Purchase', content: <WishToPurchaseSection /> },
        ]}
      />
    </Container>
  );
}
