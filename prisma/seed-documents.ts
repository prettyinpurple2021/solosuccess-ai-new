import { PrismaClient } from '@prisma/client';
import { documentTemplates } from '../lib/data/document-templates';

const prisma = new PrismaClient();

async function seedDocumentTemplates() {
  console.log('Seeding document templates...');

  for (const template of documentTemplates) {
    await prisma.documentTemplate.upsert({
      where: {
        // Use a combination of name and documentType as unique identifier
        id: `${template.documentType}-default`
      },
      update: {
        ...template,
        isCustom: false,
        isActive: true
      },
      create: {
        id: `${template.documentType}-default`,
        ...template,
        isCustom: false,
        isActive: true
      }
    });

    console.log(`✓ Seeded template: ${template.name}`);
  }

  console.log('Document templates seeded successfully!');
}

seedDocumentTemplates()
  .catch((e) => {
    console.error('Error seeding document templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
