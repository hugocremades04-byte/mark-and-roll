import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/sachet-cafe-the-personnalise')({
  head: () => headPageMotCle('/sachet-cafe-the-personnalise'),
  component: () => <PageMotCle chemin="/sachet-cafe-the-personnalise" />,
});
