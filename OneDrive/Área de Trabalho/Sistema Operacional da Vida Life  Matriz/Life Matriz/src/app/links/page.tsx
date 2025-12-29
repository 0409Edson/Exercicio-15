'use client';

import { motion } from 'framer-motion';
import {
    ExternalLink,
    Youtube,
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    MessageCircle,
    Mail,
    Music,
    Film,
    ShoppingCart,
    CreditCard,
    Landmark,
    Cloud,
    FileText,
    Calendar,
    Video,
    Headphones,
    Briefcase,
    GraduationCap,
    Heart,
    Plane,
    Car,
    Home,
    Utensils,
    Sparkles
} from 'lucide-react';

interface LinkItem {
    name: string;
    url: string;
    icon: React.ReactNode;
    color: string;
    category: string;
}

const links: LinkItem[] = [
    // Redes Sociais
    { name: 'YouTube', url: 'https://youtube.com', icon: <Youtube />, color: 'bg-red-500', category: 'redes' },
    { name: 'Instagram', url: 'https://instagram.com', icon: <Instagram />, color: 'bg-gradient-to-br from-purple-500 to-pink-500', category: 'redes' },
    { name: 'Facebook', url: 'https://facebook.com', icon: <Facebook />, color: 'bg-blue-600', category: 'redes' },
    { name: 'Twitter/X', url: 'https://twitter.com', icon: <Twitter />, color: 'bg-gray-800', category: 'redes' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: <Linkedin />, color: 'bg-blue-700', category: 'redes' },
    { name: 'TikTok', url: 'https://tiktok.com', icon: <Film />, color: 'bg-black', category: 'redes' },

    // Comunicação
    { name: 'WhatsApp Web', url: 'https://web.whatsapp.com', icon: <MessageCircle />, color: 'bg-green-500', category: 'comunicacao' },
    { name: 'Telegram', url: 'https://web.telegram.org', icon: <MessageCircle />, color: 'bg-sky-500', category: 'comunicacao' },
    { name: 'Gmail', url: 'https://mail.google.com', icon: <Mail />, color: 'bg-red-600', category: 'comunicacao' },
    { name: 'Outlook', url: 'https://outlook.live.com', icon: <Mail />, color: 'bg-blue-500', category: 'comunicacao' },
    { name: 'Discord', url: 'https://discord.com', icon: <Headphones />, color: 'bg-indigo-600', category: 'comunicacao' },

    // Streaming
    { name: 'Netflix', url: 'https://netflix.com', icon: <Film />, color: 'bg-red-700', category: 'streaming' },
    { name: 'Spotify', url: 'https://open.spotify.com', icon: <Music />, color: 'bg-green-600', category: 'streaming' },
    { name: 'Prime Video', url: 'https://primevideo.com', icon: <Film />, color: 'bg-blue-400', category: 'streaming' },
    { name: 'Disney+', url: 'https://disneyplus.com', icon: <Film />, color: 'bg-blue-800', category: 'streaming' },

    // Produtividade
    { name: 'Google Drive', url: 'https://drive.google.com', icon: <Cloud />, color: 'bg-yellow-500', category: 'produtividade' },
    { name: 'Google Docs', url: 'https://docs.google.com', icon: <FileText />, color: 'bg-blue-500', category: 'produtividade' },
    { name: 'Google Calendar', url: 'https://calendar.google.com', icon: <Calendar />, color: 'bg-blue-600', category: 'produtividade' },
    { name: 'Notion', url: 'https://notion.so', icon: <FileText />, color: 'bg-gray-800', category: 'produtividade' },
    { name: 'Trello', url: 'https://trello.com', icon: <Briefcase />, color: 'bg-blue-500', category: 'produtividade' },
    { name: 'Google Meet', url: 'https://meet.google.com', icon: <Video />, color: 'bg-green-600', category: 'produtividade' },
    { name: 'Zoom', url: 'https://zoom.us', icon: <Video />, color: 'bg-blue-500', category: 'produtividade' },

    // Finanças
    { name: 'Nubank', url: 'https://app.nubank.com.br', icon: <CreditCard />, color: 'bg-purple-600', category: 'financas' },
    { name: 'Banco do Brasil', url: 'https://bb.com.br', icon: <Landmark />, color: 'bg-yellow-500', category: 'financas' },
    { name: 'Caixa', url: 'https://caixa.gov.br', icon: <Landmark />, color: 'bg-blue-600', category: 'financas' },
    { name: 'Itaú', url: 'https://itau.com.br', icon: <Landmark />, color: 'bg-orange-500', category: 'financas' },
    { name: 'Bradesco', url: 'https://bradesco.com.br', icon: <Landmark />, color: 'bg-red-600', category: 'financas' },
    { name: 'Mercado Pago', url: 'https://mercadopago.com.br', icon: <CreditCard />, color: 'bg-sky-400', category: 'financas' },

    // Compras
    { name: 'Amazon', url: 'https://amazon.com.br', icon: <ShoppingCart />, color: 'bg-orange-500', category: 'compras' },
    { name: 'Mercado Livre', url: 'https://mercadolivre.com.br', icon: <ShoppingCart />, color: 'bg-yellow-400', category: 'compras' },
    { name: 'Magazine Luiza', url: 'https://magazineluiza.com.br', icon: <ShoppingCart />, color: 'bg-blue-600', category: 'compras' },
    { name: 'Shopee', url: 'https://shopee.com.br', icon: <ShoppingCart />, color: 'bg-orange-600', category: 'compras' },
    { name: 'AliExpress', url: 'https://aliexpress.com', icon: <ShoppingCart />, color: 'bg-red-500', category: 'compras' },

    // Serviços
    { name: 'iFood', url: 'https://ifood.com.br', icon: <Utensils />, color: 'bg-red-500', category: 'servicos' },
    { name: 'Uber', url: 'https://uber.com', icon: <Car />, color: 'bg-black', category: 'servicos' },
    { name: '99', url: 'https://99app.com', icon: <Car />, color: 'bg-yellow-500', category: 'servicos' },
    { name: 'Airbnb', url: 'https://airbnb.com.br', icon: <Home />, color: 'bg-pink-500', category: 'servicos' },
    { name: 'Booking', url: 'https://booking.com', icon: <Plane />, color: 'bg-blue-700', category: 'servicos' },

    // Educação
    { name: 'Coursera', url: 'https://coursera.org', icon: <GraduationCap />, color: 'bg-blue-600', category: 'educacao' },
    { name: 'Udemy', url: 'https://udemy.com', icon: <GraduationCap />, color: 'bg-purple-600', category: 'educacao' },
    { name: 'Khan Academy', url: 'https://pt.khanacademy.org', icon: <GraduationCap />, color: 'bg-green-600', category: 'educacao' },
    { name: 'Duolingo', url: 'https://duolingo.com', icon: <GraduationCap />, color: 'bg-green-500', category: 'educacao' },

    // Saúde
    { name: 'Dr. Consulta', url: 'https://drconsulta.com', icon: <Heart />, color: 'bg-red-500', category: 'saude' },
    { name: 'Drogasil', url: 'https://drogasil.com.br', icon: <Heart />, color: 'bg-red-600', category: 'saude' },
];

const categories = [
    { id: 'redes', label: '📱 Redes Sociais' },
    { id: 'comunicacao', label: '💬 Comunicação' },
    { id: 'streaming', label: '🎬 Streaming' },
    { id: 'produtividade', label: '💼 Produtividade' },
    { id: 'financas', label: '💰 Finanças' },
    { id: 'compras', label: '🛒 Compras' },
    { id: 'servicos', label: '🚗 Serviços' },
    { id: 'educacao', label: '🎓 Educação' },
    { id: 'saude', label: '❤️ Saúde' },
];

export default function LinksPage() {
    const openLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ExternalLink className="text-teal-400" />
                    Redes Sociais
                </h1>
                <p className="text-gray-400 mt-1">
                    Acesso rápido às suas plataformas e redes favoritas
                </p>
            </motion.div>

            {/* Categories */}
            {categories.map((category, catIndex) => {
                const categoryLinks = links.filter((l) => l.category === category.id);

                return (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIndex * 0.1 }}
                    >
                        <h2 className="text-lg font-semibold mb-4">{category.label}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {categoryLinks.map((link, index) => (
                                <motion.button
                                    key={link.name}
                                    onClick={() => openLink(link.url)}
                                    className="glass-card p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: catIndex * 0.1 + index * 0.03 }}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center text-white`}>
                                        {link.icon}
                                    </div>
                                    <span className="text-sm font-medium text-center">{link.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                );
            })}

            {/* AI Suggestion */}
            <motion.div
                className="glass-card p-6 border border-purple-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold">💡 Dica da Juliana</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Esses links abrem em uma nova aba. Você pode adicionar o Life Matriz na barra de favoritos para acessar tudo de um só lugar!
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
