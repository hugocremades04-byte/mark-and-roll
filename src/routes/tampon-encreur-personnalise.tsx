import { createFileRoute } from '@tanstack/react-router';
import { PageMotCle, headPageMotCle } from '@/components/boutique/PageMotCle';

export const Route = createFileRoute('/tampon-encreur-personnalise')({
  head: () => headPageMotCle('/tampon-encreur-personnalise'),
  component: () => <PageMotCle chemin="/tampon-encreur-personnalise" />,
});
