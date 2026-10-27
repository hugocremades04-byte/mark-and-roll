import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/emballage-savon-personnalise')({
  head: () => headPageMotCle('/emballage-savon-personnalise'),
  component: () => <PageMotCle chemin="/emballage-savon-personnalise" />,
});
