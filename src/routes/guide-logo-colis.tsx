import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/guide-logo-colis')({
  head: () => headPageMotCle('/guide-logo-colis'),
  component: () => <PageMotCle chemin="/guide-logo-colis" />,
});
