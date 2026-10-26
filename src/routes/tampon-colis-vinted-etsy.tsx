import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/tampon-colis-vinted-etsy')({
  head: () => headPageMotCle('/tampon-colis-vinted-etsy'),
  component: () => <PageMotCle chemin="/tampon-colis-vinted-etsy" />,
});
