import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/guide-packaging-petite-marque')({
  head: () => headPageMotCle('/guide-packaging-petite-marque'),
  component: () => <PageMotCle chemin="/guide-packaging-petite-marque" />,
});
