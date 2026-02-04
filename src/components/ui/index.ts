// /src/components/ui/index.ts
// ✅ Export centralisé des composants UI - Solution360°

export { Button } from './Button';
export type { ButtonProps } from './Button';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from './Card';
export type { CardProps } from './Card';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { Input } from './Input';
export type { InputProps } from './Input';

export { LoadingSpinner, ButtonSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { Toast, useToast } from './Toast';
export type { ToastProps, ToastType } from './Toast';

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './Table';
export type { TableProps } from './Table';

export { Select } from './Select';
export type { SelectProps } from './Select';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Alert } from './Alert';
export type { AlertProps } from './Alert';
