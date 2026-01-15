// /src/components/Logo.tsx
// ✅ Composant Logo réutilisable pour Solution360°
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { logo: 24, text: 'text-sm' },
  md: { logo: 32, text: 'text-base' },
  lg: { logo: 48, text: 'text-lg' },
  xl: { logo: 64, text: 'text-xl' },
};

export default function Logo({ 
  size = 'md', 
  showText = true, 
  href = '/',
  className = ''
}: LogoProps) {
  const { logo: logoSize, text: textSize } = sizeMap[size];
  
  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-shrink-0">
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

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

