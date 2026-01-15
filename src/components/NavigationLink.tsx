'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavigationLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function NavigationLink({ 
  href, 
  children, 
  className = '',
  onClick 
}: NavigationLinkProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isActive = pathname === href

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick()
    }
    
    // Si déjà sur la page, ne pas naviguer
    if (pathname === href) {
      e.preventDefault()
      return
    }

    // Afficher le loading immédiatement
    setIsLoading(true)
    
    // Utiliser prefetch pour améliorer les performances
    router.prefetch(href)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`relative ${className} ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
    >
      {children}
      {isLoading && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
    </Link>
  )
}

