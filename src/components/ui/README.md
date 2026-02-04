# 🎨 Composants UI Réutilisables - Solution360°

Cette librairie contient tous les composants UI réutilisables pour Solution360°, conçus pour être cohérents avec le design system (orange/vert, arrondis, ombres).

---

## 📦 Installation

Les dépendances nécessaires sont déjà installées :
- `clsx` - Pour gérer les classes conditionnelles
- `tailwind-merge` - Pour fusionner les classes Tailwind
- `lucide-react` - Pour les icônes

---

## 🚀 Utilisation

### Import

```tsx
// Import individuel
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

// Ou import groupé
import { Button, Card, Badge, Input } from '@/components/ui';
```

---

## 📚 Composants Disponibles

### 1. **Button** - Boutons avec variants

```tsx
import { Button } from '@/components/ui';

// Variants disponibles : primary, secondary, success, danger, outline, ghost
<Button variant="primary" size="md">
  Cliquer ici
</Button>

// Avec icône
<Button variant="primary" leftIcon={<Icon />}>
  Action
</Button>

// État de chargement
<Button isLoading={true}>
  Envoi en cours...
</Button>
```

**Props :**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode

---

### 2. **Card** - Cartes avec sections

```tsx
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui';

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
  </CardHeader>
  <CardBody>
    <p>Contenu de la carte</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Variants :** 'default' | 'bordered' | 'elevated' | 'outlined'

---

### 3. **Badge** - Badges de statut

```tsx
import { Badge } from '@/components/ui';

// Avec statut automatique (recommandé)
<Badge status="delivered">Livré</Badge>
<Badge status="in_production">En production</Badge>

// Avec variant manuel
<Badge variant="success" size="md">
  Succès
</Badge>
```

**Statuts disponibles :**
- `draft`, `analysis`, `awaiting_payment`, `in_production`, `delivered`, `cancelled`, `pending`

**Variants :** 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray'

---

### 4. **Input** - Champs de saisie

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="votre@email.com"
  error={errors.email}
  helperText="Nous ne partagerons jamais votre email"
  required
/>

// Avec icône
<Input
  leftIcon={<MailIcon />}
  placeholder="Rechercher..."
/>
```

---

### 5. **Select** - Listes déroulantes

```tsx
import { Select } from '@/components/ui';

<Select
  label="Statut"
  options={[
    { value: 'draft', label: 'Brouillon' },
    { value: 'analysis', label: 'En analyse' },
    { value: 'delivered', label: 'Livré' },
  ]}
  error={errors.status}
/>
```

---

### 6. **Modal** - Modales

```tsx
import { Modal } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmer l'action"
  size="md"
>
  <p>Êtes-vous sûr de vouloir continuer ?</p>
  <div className="flex gap-3 mt-4">
    <Button onClick={() => setIsOpen(false)}>Annuler</Button>
    <Button variant="danger">Confirmer</Button>
  </div>
</Modal>
```

**Tailles :** 'sm' | 'md' | 'lg' | 'xl'

---

### 7. **Toast** - Notifications

```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { showToast, ToastContainer } = useToast();

  const handleSuccess = () => {
    showToast('Opération réussie !', 'success');
  };

  return (
    <>
      <Button onClick={handleSuccess}>Action</Button>
      <ToastContainer />
    </>
  );
}
```

**Types :** 'success' | 'error' | 'warning' | 'info'

---

### 8. **LoadingSpinner** - Indicateurs de chargement

```tsx
import { LoadingSpinner } from '@/components/ui';

// Spinner standalone
<LoadingSpinner size="md" text="Chargement..." />

// Spinner pour bouton (déjà intégré dans Button avec isLoading)
```

---

### 9. **Table** - Tableaux de données

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';

<Table striped hover>
  <TableHeader>
    <TableRow>
      <TableHead>Nom</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Statut</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>
        <Badge status="delivered">Livré</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🎨 Design System

### Couleurs

- **Primary (Orange)** : `#FF6B35` - Actions principales
- **Success (Vert)** : `#2ECC71` - Succès, confirmations
- **Danger (Rouge)** : `#E74C3C` - Erreurs, suppressions
- **Warning (Jaune)** : `#F39C12` - Avertissements
- **Info (Bleu)** : `#4ECDC4` - Informations

### Styles

- **Border radius** : `rounded-xl` (12px) ou `rounded-2xl` (16px)
- **Shadows** : `shadow-sm`, `shadow-lg`, `shadow-xl`
- **Transitions** : `transition-all duration-200`

---

## 📝 Exemples Complets

### Formulaire avec validation

```tsx
import { Card, CardHeader, CardTitle, CardBody, CardFooter, Input, Button, Select } from '@/components/ui';

function MyForm() {
  const [errors, setErrors] = useState({});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle demande</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <Input
            label="Titre"
            placeholder="Titre de la demande"
            error={errors.title}
            required
          />
          <Select
            label="Statut"
            options={statusOptions}
            error={errors.status}
          />
        </div>
      </CardBody>
      <CardFooter>
        <Button variant="primary">Enregistrer</Button>
        <Button variant="outline">Annuler</Button>
      </CardFooter>
    </Card>
  );
}
```

### Liste avec badges

```tsx
import { Card, CardBody, Badge, Button } from '@/components/ui';

function DemandesList({ demandes }) {
  return (
    <div className="space-y-4">
      {demandes.map((demande) => (
        <Card key={demande.id}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h3>{demande.title}</h3>
                <Badge status={demande.status} />
              </div>
              <Button variant="primary" size="sm">
                Voir détails
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
```

---

## ✅ Bonnes Pratiques

1. **Utiliser les composants UI** au lieu de créer des styles inline
2. **Respecter les variants** pour maintenir la cohérence
3. **Utiliser Badge avec status** pour les statuts de demandes
4. **Toujours inclure ToastContainer** si vous utilisez les toasts
5. **Gérer les états de chargement** avec `isLoading` sur les boutons

---

## 🔧 Personnalisation

Tous les composants acceptent une prop `className` pour la personnalisation :

```tsx
<Button className="w-full">Bouton pleine largeur</Button>
<Card className="max-w-md mx-auto">Carte centrée</Card>
```

---

**Créé par MonAP - Solution360°**  
*Dernière mise à jour : 2026*
