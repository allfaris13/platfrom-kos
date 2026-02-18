import { Home, User } from 'lucide-react';

interface FooterProps {
  setActiveView: (view: string) => void;
}

export function Footer({ setActiveView }: FooterProps) {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 mt-24 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-stone-400 to-stone-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white">Rahmat ZAW</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">Hunian kost putra premium di kawasan Sigura-gura, Malang. Nyaman, aman, dan strategis.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:contents">
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wide text-sm">Tautan Cepat</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => setActiveView('home')} className="text-slate-400 hover:text-white transition-colors">Beranda</button></li>
                <li><button onClick={() => setActiveView('gallery')} className="text-slate-400 hover:text-white transition-colors">Galeri</button></li>
                <li><button onClick={() => setActiveView('contact')} className="text-slate-400 hover:text-white transition-colors">Kontak</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wide text-sm">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white uppercase tracking-wide text-sm">Kontak</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <User className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                <span>support@rahmatzaw.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800/50 my-8" />
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-400 text-sm text-center md:text-left mb-4 md:mb-0">
            &copy; 2026 Kost Putra Rahmat ZAW. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
