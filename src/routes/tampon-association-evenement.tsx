import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/tampon-association-evenement')({
  head: () => headPageMotCle('/tampon-association-evenement'),
  component: () => <PageMotCle chemin="/tampon-association-evenement" />,
});
