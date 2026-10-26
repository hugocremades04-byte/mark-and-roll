import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/tampon-mariage-personnalise')({
  head: () => headPageMotCle('/tampon-mariage-personnalise'),
  component: () => <PageMotCle chemin="/tampon-mariage-personnalise" />,
});
