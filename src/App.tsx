import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, 
  Phone, 
  Instagram, 
  Facebook, 
  Clock, 
  MapPin, 
  Menu, 
  X,
  Maximize2
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDocFromServer
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { cn } from './lib/utils';

// --- Types ---
interface Service {
  id: string;
  name: string;
  price: string;
  description: string;
  category: 'hair' | 'grooming' | 'beauty';
  order?: number;
}

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: string;
  createdAt?: any;
}

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4",
      isScrolled ? "bg-luxury-black/90 backdrop-blur-md border-b border-gold/20 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <a href="#" className="text-2xl md:text-3xl font-serif font-bold tracking-tighter text-gold">
          VIETNAM <span className="text-luxury-paper">BURGER</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm uppercase tracking-widest hover:text-gold transition-colors"
            >
              {link.name}
            </a>
          ))}
          
          <a 
            href="https://wa.me/2349118970291" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-gold py-2 px-6 text-xs"
          >
            Book Now
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-gold"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-luxury-black border-b border-gold/20 md:hidden flex flex-col items-center py-8 space-y-6"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg uppercase tracking-widest hover:text-gold transition-colors"
              >
                {link.name}
              </a>
            ))}
            
            <a 
              href="https://wa.me/2349118970291" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-gold w-3/4 text-center"
            >
              Book Appointment
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Lightbox = ({ image, onClose }: { image: GalleryImage | null, onClose: () => void }) => {
  if (!image) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <button className="absolute top-6 right-6 text-luxury-paper hover:text-gold transition-colors">
        <X size={32} />
      </button>
      <motion.img 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        src={image.url} 
        alt={image.alt}
        className="max-w-full max-h-full object-contain gold-border"
        onClick={(e) => e.stopPropagation()}
        referrerPolicy="no-referrer"
      />
      <div className="absolute bottom-10 left-0 w-full text-center">
        <h3 className="text-gold text-2xl font-serif">{image.alt}</h3>
        <p className="text-luxury-paper/60 uppercase tracking-widest text-xs mt-2">{image.category}</p>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [services, setServices] = useState<Service[]>([
    {
      id: 'default-1',
      name: "The Precision Blade",
      price: "₦5,000",
      description: "Define your profile with the sharpest fades and surgical line-ups. Master-level grooming that commands respect.",
      category: "hair",
      order: 1
    },
    {
      id: 'default-2',
      name: "Neon Burger Tints",
      price: "₦10,000",
      description: "Transform your vibe with bold, vibrant tints and expert bleaching. High-energy color designed to turn heads.",
      category: "hair",
      order: 2
    },
    {
      id: 'default-3',
      name: "The Artisan Crown",
      price: "₦15,000",
      description: "Slay the game with flawless knotless braids and intricate cornrows. Protective styles crafted for the elite.",
      category: "beauty",
      order: 3
    },
    {
      id: 'default-4',
      name: "The Gold Standard",
      price: "₦8,000",
      description: "Indulge in the ultimate scalp care ritual. Deep-cleansing and revitalizing treatments for true hair health.",
      category: "grooming",
      order: 4
    }
  ]);
  const [gallery, setGallery] = useState<GalleryImage[]>([
    {
      id: 'g-1',
      url: "https://picsum.photos/seed/v-fade/800/1000",
      alt: "Signature V-Burger Fade",
      category: "Hair"
    },
    {
      id: 'g-2',
      url: "https://picsum.photos/seed/v-braids/800/1000",
      alt: "Artisan Knotless Braids",
      category: "Beauty"
    },
    {
      id: 'g-3',
      url: "https://picsum.photos/seed/v-tint/800/1000",
      alt: "Neon Urban Tint",
      category: "Hair"
    }
  ]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    // ... test connection ...
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // Fetch Services
    const qServices = collection(db, 'services');
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      if (data.length > 0) {
        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setServices(data);
      }
      setIsLoading(false);
    }, (error) => {
      console.warn("Firestore access restricted or empty. Using default vibe data.");
      setIsLoading(false);
    });

    // Fetch Gallery
    const qGallery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubGallery = onSnapshot(qGallery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
      if (data.length > 0) {
        setGallery(data);
      }
    }, (error) => {
      console.warn("Gallery access restricted or empty. Using default vibe data.");
    });

    return () => {
      unsubServices();
      unsubGallery();
    };
  }, []);

  return (
    <div className="min-h-screen selection:bg-gold selection:text-luxury-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/salon-hero/1920/1080?blur=2" 
            alt="Luxury Salon" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/60 via-transparent to-luxury-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="uppercase tracking-[0.5em] text-gold text-sm mb-4 block">Unisex Luxury Salon</span>
            <h1 className="text-6xl md:text-9xl font-serif mb-8 leading-tight">
              VIETNAM <br />
              <span className="gold-gradient-text">BURGER</span>
            </h1>
            <p className="text-lg md:text-xl text-luxury-paper/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Where urban edge meets elite prestige. Discover the new standard of unisex grooming, from signature fades to artisanal braiding.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a href="https://wa.me/2349118970291" target="_blank" rel="noopener noreferrer" className="btn-gold">
                Book Your Transformation
              </a>
              <a href="#services" className="text-luxury-paper uppercase tracking-widest text-sm border-b border-luxury-paper/30 pb-1 hover:border-gold hover:text-gold transition-all">
                Explore Services
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gold/50"
        >
          <div className="w-px h-16 bg-gradient-to-b from-gold/50 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-luxury-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Services</h2>
            <div className="w-24 h-px bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.length > 0 ? services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 gold-border hover:bg-gold/5 transition-colors group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-serif text-luxury-paper group-hover:text-gold transition-colors">{service.name}</h3>
                  <span className="text-gold font-bold">{service.price}</span>
                </div>
                <p className="text-luxury-paper/60 font-light leading-relaxed mb-6">
                  {service.description}
                </p>
                <div className="flex items-center text-xs uppercase tracking-widest text-gold/40 group-hover:text-gold transition-colors">
                  <Scissors size={14} className="mr-2" />
                  {service.category}
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center text-luxury-paper/40 py-20">
                {isLoading ? "Loading services..." : "Our services are being updated. Check back soon!"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-6 bg-luxury-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">The Gallery</h2>
            <p className="text-luxury-paper/60 uppercase tracking-widest text-sm">Visual Excellence</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.length > 0 ? gallery.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative aspect-[4/5] overflow-hidden group cursor-pointer gold-border"
                onClick={() => setSelectedImage(img)}
              >
                <img 
                  src={img.url} 
                  alt={img.alt} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-luxury-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                  <Maximize2 className="text-gold mb-2" size={32} />
                  <span className="text-luxury-paper uppercase tracking-widest text-xs">{img.alt}</span>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center text-luxury-paper/40 py-20">
                {isLoading ? "Loading gallery..." : "Our gallery is being updated. New styles coming soon!"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-luxury-black relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-serif text-gold mb-8">The Culture of <br />Excellence</h2>
            <p className="text-lg text-luxury-paper/70 mb-8 leading-relaxed font-light">
              Vietnam Burger Unisex Salon is more than a destination; it's a statement. Born in the heart of the city, we specialize in high-definition fades, artisanal braiding, and elite tinting for those who refuse to settle for ordinary.
            </p>
            <p className="text-lg text-luxury-paper/70 mb-10 leading-relaxed font-light">
              Our master stylists blend urban edge with high-end sophistication, ensuring every client leaves with a look that commands respect. Join the movement on TikTok <a href="https://www.tiktok.com/@vietnam_burger_salon1" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">@vietnam_burger_salon1</a>.
            </p>
            
            {/* Why Choose Us */}
            <div className="space-y-8 mt-12">
              <h3 className="text-2xl font-serif text-gold">Why Choose Us?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 border-l border-gold/30">
                  <h4 className="text-luxury-paper font-medium mb-2">Elite Unisex Services</h4>
                  <p className="text-sm text-luxury-paper/50">Master-level grooming tailored for both men and women.</p>
                </div>
                <div className="p-4 border-l border-gold/30">
                  <h4 className="text-luxury-paper font-medium mb-2">Instant Booking</h4>
                  <p className="text-sm text-luxury-paper/50">Skip the line. Book your slot effortlessly via WhatsApp.</p>
                </div>
                <div className="p-4 border-l border-gold/30">
                  <h4 className="text-luxury-paper font-medium mb-2">Urban Sophistication</h4>
                  <p className="text-sm text-luxury-paper/50">A high-end atmosphere designed for the modern trendsetter.</p>
                </div>
                <div className="p-4 border-l border-gold/30">
                  <h4 className="text-luxury-paper font-medium mb-2">Precision Artistry</h4>
                  <p className="text-sm text-luxury-paper/50">Specializing in sharp fades, intricate braids, and vibrant tints.</p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-full h-full border border-gold/30 z-0" />
            <img 
              src="https://picsum.photos/seed/urban-grooming/800/1000" 
              alt="Elite grooming at Vietnam Burger" 
              className="relative z-10 w-full h-auto gold-border"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-luxury-black border-t border-gold/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <h2 className="text-4xl font-serif text-gold mb-8">Visit Us</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="text-gold mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="uppercase tracking-widest text-xs text-gold mb-1">Location</h4>
                    <p className="text-luxury-paper/70 font-light">123 Luxury Avenue, Victoria Island<br />Lagos, Nigeria</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="text-gold mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="uppercase tracking-widest text-xs text-gold mb-1">Hours</h4>
                    <p className="text-luxury-paper/70 font-light">Mon - Sat: 9:00 AM - 8:00 PM<br />Sun: 12:00 PM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-gold mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="uppercase tracking-widest text-xs text-gold mb-1">Contact</h4>
                    <p className="text-luxury-paper/70 font-light">+234 911 897 0291</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-gold/5 p-10 gold-border">
              <h3 className="text-3xl font-serif text-gold mb-6">Elevate Your Identity</h3>
              <p className="text-luxury-paper/70 mb-10 font-light">
                Ready for a transformation that commands attention? Our master stylists are ready for you. Secure your elite grooming experience instantly via WhatsApp.
              </p>
              <a 
                href="https://wa.me/2349118970291" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center"
              >
                <Phone className="mr-2" size={20} />
                Book via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-luxury-black border-t border-gold/10 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-serif text-gold mb-6 tracking-tighter">VIETNAM BURGER</h2>
          <div className="flex justify-center space-x-6 mb-8">
            <a href="https://www.tiktok.com/@vietnam_burger_salon1" target="_blank" rel="noopener noreferrer" className="text-luxury-paper/40 hover:text-gold transition-colors">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13 1.96-.12 3.92-.12 5.88 0 2.54-1.15 5.13-3.39 6.32-2.3 1.22-5.39 1.13-7.5-.41-2.11-1.54-3.1-4.35-2.22-6.73.74-2.01 2.82-3.51 4.94-3.51.57 0 1.14.1 1.69.24V12.4c-.88-.25-1.85-.29-2.73-.01-1.43.46-2.47 1.91-2.33 3.41.08 1.56 1.4 2.92 2.96 2.91 1.54-.01 2.85-1.28 2.92-2.82.02-4.35.01-8.7.01-13.05-.01-.94.01-1.88-.01-2.82z"/>
              </svg>
            </a>
            <a href="#" className="text-luxury-paper/40 hover:text-gold transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-luxury-paper/40 hover:text-gold transition-colors"><Facebook size={20} /></a>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-luxury-paper/30">
            © {new Date().getFullYear()} Vietnam Burger Unisex Salon. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
