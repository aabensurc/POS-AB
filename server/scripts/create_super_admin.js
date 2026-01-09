require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load env from root
const { sequelize, Company, User, Settings } = require('../models');
const bcrypt = require('bcryptjs');

const createSuperAdmin = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); // Ensure Schema is updated (Enum)

        console.log('Database connected & synced.');

        // 1. Create/Find SaaS Company
        let comp = await Company.findOne({ where: { name: 'SaaS Admin' } });
        if (!comp) {
            comp = await Company.create({
                name: 'SaaS Admin',
                ruc: '99999999999',
                address: 'Cloud',
                plan: 'enterprise',
                isActive: true
            });
            console.log('Created SaaS Admin Company.');

            // Create Settings
            await Settings.create({
                companyName: 'SaaS Admin',
                companyId: comp.id
            });
        }

        // 2. Create Super Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('master123', salt);

        const [user, created] = await User.findOrCreate({
            where: { username: 'master' },
            defaults: {
                name: 'Super Admin',
                password: hashedPassword,
                role: 'superadmin',
                companyId: comp.id
            }
        });

        if (created) {
            console.log('Super Admin user created: master / master123');
        } else {
            console.log('Super Admin user already exists. Resetting password...');
            user.password = hashedPassword;
            user.role = 'superadmin'; // Ensure role is correct
            await user.save();
            console.log('Super Admin password reset to: master123');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

createSuperAdmin();
