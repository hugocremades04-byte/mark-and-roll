import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/guide-papier-de-soie-personnalise')({
  head: () => headPageMotCle('/guide-papier-de-soie-personnalise'),
  component: () => <PageMotCle chemin="/guide-papier-de-soie-personnalise" />,
});
