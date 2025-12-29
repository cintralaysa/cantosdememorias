import { Service } from '@/lib/data';
import { Check, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group border-4 border-black rounded-[2.5rem] overflow-hidden bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-8px] transition-all duration-300 flex flex-col h-full">
      <div className="relative h-60 w-full">
        <Image 
          src={service.image} 
          alt={service.title} 
          fill 
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        <div className="absolute top-4 right-4">
          <div className="bg-black text-white p-2 rounded-full shadow-lg">
            <Play className="w-5 h-5 fill-current" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="bg-violet-500 text-white px-5 py-2 rounded-xl font-black text-2xl border-4 border-black shadow-lg">
            R$ {service.price.toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">{service.title}</h3>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-2xl border-2 border-black">
          <p className="text-[10px] font-black uppercase mb-2 text-gray-400 tracking-widest">
            Ouça um exemplo:
          </p>
          <audio controls className="w-full h-8">
            <source src={service.audioSample} type="audio/mpeg" />
          </audio>
        </div>

        <p className="text-gray-600 font-bold mb-6 text-sm leading-relaxed flex-grow">
          {service.description}
        </p>
        
        <div className="space-y-3 mb-8">
          {service.features.map((feature, i) => (
            <div key={i} className="flex items-center text-[10px] font-black uppercase tracking-tight">
              <Check className="w-4 h-4 mr-2 text-green-600" strokeWidth={4} />
              {feature}
            </div>
          ))}
        </div>
        
        <Link 
          href={`/servicos/${service.slug}`} 
          className="block bg-black text-white w-full py-5 rounded-2xl font-black text-center uppercase tracking-widest text-lg hover:bg-violet-500 transition-all shadow-xl active:scale-95"
        >
          Contratar Agora
        </Link>
      </div>
    </div>
  );
}