/** Redirect z starej URL na novú - 301 Permanent */

import { permanentRedirect } from 'next/navigation';

export default function PrieskumRedirect() {
  permanentRedirect('/porovnanie-cien-taxi-2024-2025');
}
