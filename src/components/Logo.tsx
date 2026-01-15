// /src/components/Logo.tsx
// ✅ Composant Logo réutilisable pour Solution360° avec fond sombre
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
  darkBackground?: boolean; // Option pour fond sombre (par défaut true)
}

const sizeMap = {
  sm: { logo: 24, text: 'text-sm', padding: 'p-1' },
  md: { logo: 32, text: 'text-base', padding: 'p-1.5' },
  lg: { logo: 48, text: 'text-lg', padding: 'p-2' },
  xl: { logo: 64, text: 'text-xl', padding: 'p-2.5' },
};

export default function Logo({ 
  size = 'md', 
  showText = true, 
  href = '/', // Toujours vers la page d'accueil par défaut
  className = '',
  darkBackground = true // Fond sombre par défaut pour meilleur contraste
}: LogoProps) {
  const { logo: logoSize, text: textSize, padding } = sizeMap[size];
  
  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Conteneur avec fond sombre pour meilleur contraste */}
      <div className={`relative flex-shrink-0 rounded-lg ${darkBackground ? 'bg-gray-900' : 'bg-transparent'} ${padding} shadow-lg`}>
        <Image
          src="/logo.png"
          alt="Solution360° Logo"
          width={logoSize}
          height={logoSize}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-orange-600 via-green-600 to-teal-600 bg-clip-text text-transparent ${textSize}`}>
          Solution360°
        </span>
      )}
    </div>
  );

  // Toujours rendre le logo cliquable vers la page d'accueil
  return (
    <Link 
      href={href || '/'} 
      className="hover:opacity-80 transition-opacity inline-block"
      title="Retour à l'accueil"
    >
      {logoContent}
    </Link>
  );
}

