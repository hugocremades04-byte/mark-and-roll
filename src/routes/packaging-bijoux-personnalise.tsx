import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/packaging-bijoux-personnalise')({
  head: () => headPageMotCle('/packaging-bijoux-personnalise'),
  component: () => <PageMotCle chemin="/packaging-bijoux-personnalise" />,
});
