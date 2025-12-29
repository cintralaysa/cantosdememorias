"use client";

import { Music, Video, Mic, ExternalLink, Download } from 'lucide-react';

const MOCK_ORDERS = [
  {
    id: 'CM-9082',
    customer: 'CARLOS ALBERTO',
    service: 'Música Personalizada',
    status: 'NOVO PEDIDO',
    date: 'HOJE, 14:20',
    amount: 'R$ 79,90',
    type: 'musica'
  },
  {
    id: 'CM-9081',
    customer: 'MARIA EDUARDA',
    service: 'Vídeo com Música',
    status: 'EM PRODUÇÃO',
    date: 'HOJE, 09:15',
    amount: 'R$ 149,90',
    type: 'video'
  },
  {
    id: 'CM-9080',
    customer: 'JOÃO PEDRO',
    service: 'Locução Profissional',
    status: 'FINALIZADO',
    date: 'ONTEM',
    amount: 'R$ 79,90',
    type: 'locucao'
  }
];

export default function AdminPage() {
  return (
    <main className="pt-32 px-4 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Painel de Controle</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Gestão de Pedidos Cantos de Memórias</p>
        </div>
        <div className="flex gap-4">
            <div className="border border-gray-100 px-8 py-4 rounded-2xl text-center bg-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo Pendente</p>
                <p className="text-2xl font-black">R$ 2.450,80</p>
            </div>
            <button className="btn-black px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <Download className="w-4 h-4" /> Exportar
            </button>
        </div>
      </div>

      <div className="border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-6 text-xs font-black uppercase tracking-widest">ID</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest">Cliente</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest">Serviço</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest">Status</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest">Valor</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_ORDERS.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-6 font-black text-xs">#{order.id}</td>
                <td className="p-6 font-bold text-sm uppercase">{order.customer}</td>
                <td className="p-6">
                  <div className="flex items-center text-xs font-black uppercase">
                    {order.type === 'musica' && <Music className="w-4 h-4 mr-2 text-gray-400" />}
                    {order.type === 'locucao' && <Mic className="w-4 h-4 mr-2 text-gray-400" />}
                    {order.type === 'video' && <Video className="w-4 h-4 mr-2 text-gray-400" />}
                    {order.service}
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === 'FINALIZADO' ? 'bg-green-100 text-green-700' : 
                    order.status === 'NOVO PEDIDO' ? 'bg-black text-white' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-6 font-black">{order.amount}</td>
                <td className="p-6 text-right">
                  <button className="p-3 hover:bg-black hover:text-white rounded-xl transition-all border border-gray-100">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}