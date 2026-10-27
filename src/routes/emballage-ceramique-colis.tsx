import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/emballage-ceramique-colis')({
  head: () => headPageMotCle('/emballage-ceramique-colis'),
  component: () => <PageMotCle chemin="/emballage-ceramique-colis" />,
});
