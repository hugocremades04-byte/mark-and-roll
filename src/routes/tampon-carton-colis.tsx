import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/tampon-carton-colis')({
  head: () => headPageMotCle('/tampon-carton-colis'),
  component: () => <PageMotCle chemin="/tampon-carton-colis" />,
});
