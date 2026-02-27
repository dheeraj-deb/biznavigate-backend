const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function showProducts() {
  const products = await prisma.products.findMany({
    where: {
      business_id: 'dd8ae5a1-cab4-4041-849d-e108d74490d3',
      is_active: true
    },
    select: {
      product_id: true,
      name: true,
      description: true,
      category: true,
      price: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`📦 Found ${products.length} Products in Database\n`);

  // Group by category
  const byCategory = products.reduce((acc, p) => {
    const cat = p.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  Object.entries(byCategory).forEach(([category, prods]) => {
    console.log(`\n📁 ${category} (${prods.length})`);
    console.log('─'.repeat(60));
    prods.forEach(p => {
      const desc = p.description || '(no description)';
      const descShort = desc.length > 50 ? desc.substring(0, 47) + '...' : desc;
      console.log(`  • ${p.name} - ₹${p.price}`);
      console.log(`    ${descShort}`);
    });
  });

  // Show products with USB in name
  console.log('\n\n🔍 Products with "USB" in name or description:');
  console.log('─'.repeat(60));
  const usbProducts = products.filter(p =>
    (p.name && p.name.toLowerCase().includes('usb')) ||
    (p.description && p.description.toLowerCase().includes('usb'))
  );

  if (usbProducts.length === 0) {
    console.log('  ❌ No products with "USB" found');
  } else {
    usbProducts.forEach(p => {
      console.log(`  ✅ ${p.name}`);
      console.log(`     ${p.description || '(no description)'}`);
    });
  }

  await prisma.$disconnect();
}

showProducts().catch(console.error);
