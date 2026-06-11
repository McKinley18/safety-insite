import { User } from '../src/users/user.entity';
import { dataSource } from '../src/database/data-source';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(__dirname, '../.env') });

async function upgrade() {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);
  const email = 'mckinley.christopherd@gmail.com';
  
  const user = await userRepo.findOne({ where: { email } });
  if (user) {
    user.role = 'Owner';
    user.type = 'pro';
    user.planCode = 'plus';
    await userRepo.save(user);
    console.log(`Successfully upgraded user ${email} to Owner/Pro.`);
  } else {
    console.log(`User ${email} not found in the database. Creating one.`);
    const newUser = userRepo.create({
      email,
      name: 'Christopher McKinley',
      password: 'placeholder', // Will need to login or register normally, or use 'Vulcan' to register
      type: 'pro',
      planCode: 'plus',
      role: 'Owner',
      subscriptionStatus: 'active',
    });
    await userRepo.save(newUser);
    console.log(`Created user ${email} with Owner/Pro status.`);
  }
  
  await dataSource.destroy();
}

upgrade().catch(console.error);