import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seeder...')

  // ==================== ROLES ====================
  console.log('\n📋 Creating Roles...')
  const rolesData = [
    {
      name: 'master-superadmin',
      description: 'Master Super Administrator - Can register other superadmins',
      isSystem: true,
      permissions: ['all', 'superadmin.register'],
    },
    {
      name: 'superadmin',
      description: 'Super Administrator - Full system access (cannot register superadmins)',
      isSystem: true,
      permissions: ['all'],
    },
    {
      name: 'admin',
      description: 'Company Administrator - Full company access',
      isSystem: true,
      permissions: ['company.all', 'employee.all', 'project.all', 'finance.all'],
    },
    {
      name: 'manager',
      description: 'Manager - Project and team management',
      isSystem: true,
      permissions: ['project.all', 'employee.read', 'finance.read'],
    },
    {
      name: 'staff',
      description: 'Staff - Basic access',
      isSystem: true,
      permissions: ['project.read', 'task.all'],
    },
  ]

  const roles: Record<string, any> = {}

  for (const roleData of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: roleData,
      create: roleData,
    })
    roles[roleData.name] = role
    console.log(`✅ Role: ${role.name}`)
  }

  // ==================== PRICING PLANS ====================
  console.log('\n💰 Creating Pricing Plans...')
  const plansData: any[] = [
    {
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      price: 29.99,
      billingPeriod: 'MONTHLY' as const,
      maxUsers: 5,
      maxProjects: 10,
      maxStorage: 5,
      features: [
        'Basic Project Management',
        'Up to 5 users',
        '10 projects',
        '5GB storage',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      description: 'For growing businesses',
      price: 79.99,
      billingPeriod: 'MONTHLY' as const,
      maxUsers: 20,
      maxProjects: 50,
      maxStorage: 50,
      features: [
        'Advanced Project Management',
        'Procurement Management',
        'Up to 20 users',
        '50 projects',
        '50GB storage',
        'Priority support',
        'Custom reports',
      ],
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      price: 199.99,
      billingPeriod: 'MONTHLY' as const,
      maxUsers: 100,
      maxProjects: 999,
      maxStorage: 500,
      features: [
        'All Professional features',
        'Finance Management',
        'Up to 100 users',
        'Unlimited projects',
        '500GB storage',
        '24/7 support',
        'API access',
        'Custom integrations',
      ],
    },
  ]

  const plans: any[] = []

  for (const planData of plansData) {
    const plan = await prisma.pricingPlan.upsert({
      where: { name: planData.name },
      update: planData,
      create: planData,
    })
    plans.push(plan)
    console.log(`✅ Plan: ${plan.name} - $${plan.price}/${plan.billingPeriod}`)
  }

  // ==================== MASTER SUPERADMIN USER (NO COMPANY) ====================
  console.log('\n👤 Creating Master Superadmin User...')
  const masterEmail = 'master@erp-system.com'
  const masterPassword = 'MasterAdmin123!'
  const hashedMasterPassword = await bcrypt.hash(masterPassword, 10)

  const existingMaster = await prisma.user.findUnique({
    where: { email: masterEmail },
  })

  if (existingMaster) {
    console.log(`✅ Master Superadmin already exists: ${existingMaster.email}`)
  } else {
    const master = await prisma.user.create({
      data: {
        email: masterEmail,
        password: hashedMasterPassword,
        firstName: 'Master',
        lastName: 'Admin',
        roleId: roles['master-superadmin'].id,
        isActive: true,
      },
    })
    console.log(`✅ Created Master Superadmin: ${master.email}`)
    console.log(`   Password: ${masterPassword}`)
  }

  // ==================== REGULAR SUPERADMIN USER (NO COMPANY) ====================
  console.log('\n👤 Creating Regular Superadmin User...')
  const superadminEmail = 'superadmin@erp-system.com'
  const superadminPassword = 'SuperAdmin123!'
  const hashedPassword = await bcrypt.hash(superadminPassword, 10)

  const existingSuperadmin = await prisma.user.findUnique({
    where: { email: superadminEmail },
  })

  if (existingSuperadmin) {
    console.log(`✅ Superadmin already exists: ${existingSuperadmin.email}`)
  } else {
    const superadmin = await prisma.user.create({
      data: {
        email: superadminEmail,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        roleId: roles['superadmin'].id,
        isActive: true,
      },
    })
    console.log(`✅ Created Superadmin: ${superadmin.email}`)
    console.log(`   Password: ${superadminPassword}`)
  }

  // ==================== DEMO COMPANY ====================
  console.log('\n🏢 Creating Demo Company...')
  const demoCompanyName = 'Demo Company'

  // Create subscription for demo company
  const demoSubscription = await prisma.subscription.create({
    data: {
      planId: plans[1].id, // Professional plan
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      autoRenew: true,
    },
  })

  const demoCompany = await prisma.company.upsert({
    where: { name: demoCompanyName },
    update: {},
    create: {
      name: demoCompanyName,
      email: 'demo@company.com',
      phone: '+1234567890',
      address: '123 Demo Street, Demo City',
      status: 'ACTIVE',
      subscriptionId: demoSubscription.id,
    },
  })
  console.log(`✅ Company: ${demoCompany.name}`)

  // ==================== DEMO COMPANY USERS ====================
  console.log('\n👥 Creating Demo Users...')
  const demoUsers = [
    {
      email: 'admin@demo.com',
      password: 'Admin123!',
      firstName: 'John',
      lastName: 'Admin',
      roleId: roles['admin'].id,
    },
    {
      email: 'manager@demo.com',
      password: 'Manager123!',
      firstName: 'Jane',
      lastName: 'Manager',
      roleId: roles['manager'].id,
    },
    {
      email: 'staff@demo.com',
      password: 'Staff123!',
      firstName: 'Bob',
      lastName: 'Staff',
      roleId: roles['staff'].id,
    },
  ]

  for (const userData of demoUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (!existing) {
      const hashed = await bcrypt.hash(userData.password, 10)
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashed,
          companyId: demoCompany.id,
          isActive: true,
        },
      })
      console.log(`✅ User: ${user.email} - Password: ${userData.password}`)
    }
  }

  console.log('\n✨ Seeder finished!')
  console.log('\n📝 Login Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Superadmin:')
  console.log(`  Email: ${superadminEmail}`)
  console.log(`  Password: ${superadminPassword}`)
  console.log('\nDemo Company Admin:')
  console.log('  Email: admin@demo.com')
  console.log('  Password: Admin123!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
