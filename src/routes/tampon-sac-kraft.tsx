import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/tampon-sac-kraft')({
  head: () => headPageMotCle('/tampon-sac-kraft'),
  component: () => <PageMotCle chemin="/tampon-sac-kraft" />,
});
