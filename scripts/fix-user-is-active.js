"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function fixUserIsActive() {
    try {
        console.log('🔧 Fixing is_active field for all users...');
        const result = await prisma.users.updateMany({
            where: {
                OR: [
                    { is_active: null },
                    { is_active: false },
                ],
            },
            data: {
                is_active: true,
            },
        });
        console.log(`✅ Updated ${result.count} users to is_active = true`);
        const users = await prisma.users.findMany({
            select: {
                user_id: true,
                email: true,
                is_active: true,
                profile_completed: true,
            },
            take: 10,
        });
        console.log('\n📊 Sample of users (first 10):');
        console.table(users);
        console.log('\n✅ Fix completed successfully!');
    }
    catch (error) {
        console.error('❌ Error fixing users:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
fixUserIsActive()
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=fix-user-is-active.js.map