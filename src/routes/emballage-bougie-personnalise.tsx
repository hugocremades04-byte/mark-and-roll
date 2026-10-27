import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/emballage-bougie-personnalise')({
  head: () => headPageMotCle('/emballage-bougie-personnalise'),
  component: () => <PageMotCle chemin="/emballage-bougie-personnalise" />,
});
