import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useBusinessInfo } from '@/hooks/useBusinessInfo';

export const PublicFooter: React.FC = () => {
  const { businessInfo } = useBusinessInfo();
  const shopName = businessInfo?.name || 'Modern Cuts';
  const address = businessInfo?.address || '123 Main Street\nNew York, NY 10001';
  const phone = businessInfo?.phone || '(555) 123-4567';
  const email = businessInfo?.email || 'info@moderncuts.com';

  // Social media links from business info (only include if present)
  const socials = [
    { Icon: Facebook, url: businessInfo?.facebook_url },
    { Icon: Instagram, url: businessInfo?.instagram_url },
    { Icon: Twitter, url: businessInfo?.twitter_url },
    { Icon: Youtube, url: businessInfo?.youtube_url },
  ];

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Barbers', href: '/barbers' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ] as const;

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Mobile Footer */}
      <div className="block sm:hidden px-6 py-10 space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <img src="/logo/logo-tran.png" alt={`${shopName} Logo`} className="h-24 w-auto filter brightness-0 invert drop-shadow-lg" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap justify-center gap-4 text-sm font-medium">
          {navigation.map(link => (
            <Link key={link.name} to={link.href} className="text-gray-300 hover:text-white transition-colors" >{link.name}</Link>
          ))}
        </nav>

        {/* Contact */}
        <div className="space-y-1 text-gray-400 text-sm">
          <p className="whitespace-pre-line">{address}</p>
          <p>{phone}</p>
          <p>{email}</p>
        </div>

        {/* Socials */}
        {socials.filter(s => s.url).length > 0 && (
          <div className="flex justify-center gap-6 pt-2">
            {socials.filter(s => s.url).map(({ Icon, url }, idx) => (
              <a
                key={idx}
                href={url}
                className="hover:text-white transition-colors"
                aria-label="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        )}

        <p className="pt-6 text-xs text-gray-500">© {new Date().getFullYear()} {shopName}. All rights reserved.</p>
      </div>

      {/* Desktop / Tablet Footer */}
      <div className="hidden sm:block container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 flex flex-col items-center text-center">
            <img src="/logo/logo-tran.png" alt={`${shopName} Logo`} className="h-[11rem] w-auto filter brightness-0 invert drop-shadow-lg" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Haircuts
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Beard Trims
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Hot Towel Shaves
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Hair Coloring
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-400 whitespace-pre-line">{address}</li>
              <li className="text-sm text-gray-400">{phone}</li>
              <li className="text-sm text-gray-400">{email}</li>
            </ul>
            
            {socials.filter(s => s.url).length > 0 && (
              <div className="flex space-x-4 mt-4">
                {socials.filter(s => s.url).map(({ Icon, url }, idx) => (
                  <a
                    key={idx}
                    href={url}
                    className="hover:text-white transition-colors"
                    aria-label="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} {shopName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};