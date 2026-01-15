// /src/components/LogoText.tsx
// ✅ Composant pour afficher le texte "Solution360°" avec dégradé orange vers vert
interface LogoTextProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

export default function LogoText({ 
  size = 'lg',
  className = ''
}: LogoTextProps) {
  return (
    <h1 className={`font-black ${sizeMap[size]} ${className}`}>
      <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-green-600 bg-clip-text text-transparent">
        Solution
      </span>
      <span className="bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
        360°
      </span>
    </h1>
  );
}

