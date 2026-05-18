import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

const now = new Date();

const dayAgo = (days) => {
  const date = new Date(now);
  date.setDate(now.getDate() - days);
  return date;
};

const leads = [
  {
    name: 'Laura Mendoza',
    email: 'laura.mendoza@example.com',
    phone: '+573001112233',
    source: 'instagram',
    productInterest: 'Curso de copywriting para lanzamientos',
    budget: '450.00',
    createdAt: dayAgo(0),
  },
  {
    name: 'Andres Pardo',
    email: 'andres.pardo@example.com',
    phone: '+573004445566',
    source: 'facebook',
    productInterest: 'Mentoria 1:1 de embudos',
    budget: '1200.00',
    createdAt: dayAgo(1),
  },
  {
    name: 'Valentina Ruiz',
    email: 'valentina.ruiz@example.com',
    phone: null,
    source: 'landing_page',
    productInterest: 'Plantillas de emails de venta',
    budget: '220.00',
    createdAt: dayAgo(2),
  },
  {
    name: 'Carlos Diaz',
    email: 'carlos.diaz@example.com',
    phone: '+573007778899',
    source: 'referido',
    productInterest: 'Programa de conversion en webinars',
    budget: '850.00',
    createdAt: dayAgo(3),
  },
  {
    name: 'Marta Ojeda',
    email: 'marta.ojeda@example.com',
    phone: '+573001234567',
    source: 'instagram',
    productInterest: 'Consultoria de oferta high ticket',
    budget: '3000.00',
    createdAt: dayAgo(4),
  },
  {
    name: 'Julian Acosta',
    email: 'julian.acosta@example.com',
    phone: null,
    source: 'otro',
    productInterest: null,
    budget: null,
    createdAt: dayAgo(5),
  },
  {
    name: 'Fernanda Melo',
    email: 'fernanda.melo@example.com',
    phone: '+573009998877',
    source: 'landing_page',
    productInterest: 'Bootcamp de ventas por DM',
    budget: '670.00',
    createdAt: dayAgo(6),
  },
  {
    name: 'Sebastian Vega',
    email: 'sebastian.vega@example.com',
    phone: '+573001010203',
    source: 'facebook',
    productInterest: 'Masterclass evergreen',
    budget: '410.00',
    createdAt: dayAgo(8),
  },
  {
    name: 'Daniela Quintero',
    email: 'daniela.quintero@example.com',
    phone: '+573006050403',
    source: 'referido',
    productInterest: 'Sistema de seguimiento comercial',
    budget: '980.00',
    createdAt: dayAgo(11),
  },
  {
    name: 'Nicolas Henao',
    email: 'nicolas.henao@example.com',
    phone: null,
    source: 'instagram',
    productInterest: 'Curso de copy para anuncios',
    budget: '350.00',
    createdAt: dayAgo(14),
  },
  {
    name: 'Paula Restrepo',
    email: 'paula.restrepo@example.com',
    phone: '+573002040608',
    source: 'otro',
    productInterest: 'Auditoria completa de embudo',
    budget: '1500.00',
    createdAt: dayAgo(21),
  },
];

async function main() {
  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: {
        name: lead.name,
        phone: lead.phone,
        source: lead.source,
        productInterest: lead.productInterest,
        budget: lead.budget,
        deletedAt: null,
      },
      create: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        productInterest: lead.productInterest,
        budget: lead.budget,
        createdAt: lead.createdAt,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
