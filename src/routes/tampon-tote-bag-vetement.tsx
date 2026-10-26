import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/tampon-tote-bag-vetement')({
  head: () => headPageMotCle('/tampon-tote-bag-vetement'),
  component: () => <PageMotCle chemin="/tampon-tote-bag-vetement" />,
});
