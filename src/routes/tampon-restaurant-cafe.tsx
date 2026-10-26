import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/tampon-restaurant-cafe')({
  head: () => headPageMotCle('/tampon-restaurant-cafe'),
  component: () => <PageMotCle chemin="/tampon-restaurant-cafe" />,
});
