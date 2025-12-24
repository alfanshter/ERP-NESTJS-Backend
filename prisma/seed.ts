import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

// Create Pool with explicit database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://macbook@localhost:5432/erp_db?schema=public'
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seeder...')

  // ==================== ROLES ====================
  console.log('\n📋 Creating Roles...')
  const rolesData = [
    {
      name: 'superadmin-master',
      description: 'Master Super Administrator - Full control including managing superadmin staff',
      isSystem: true,
      permissions: ['all', 'superadmin.create', 'superadmin.manage'],
    },
    {
      name: 'superadmin-staff',
      description: 'Super Administrator Staff - Full system access but cannot manage other superadmins',
      isSystem: true,
      permissions: ['all', 'companies.all', 'plans.all', 'subscriptions.all'],
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
      monthlyPrice: 200000,
      yearlyPrice: 2160000,
      monthlyDiscount: 0,
      yearlyDiscount: 10,
      discountType: 'PERCENTAGE',
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
      monthlyPrice: 500000,
      yearlyPrice: 4800000,
      monthlyDiscount: 0,
      yearlyDiscount: 20,
      discountType: 'PERCENTAGE',
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
      monthlyPrice: 1000000,
      yearlyPrice: 9000000,
      monthlyDiscount: 0,
      yearlyDiscount: 25,
      discountType: 'PERCENTAGE',
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
    console.log(
      `✅ Plan: ${plan.name} - Monthly: Rp ${plan.monthlyPrice.toLocaleString('id-ID')}, Yearly: Rp ${plan.yearlyPrice.toLocaleString('id-ID')}`,
    )
  }

  // ==================== MASTER SUPERADMIN USER (NO COMPANY) ====================
  console.log('\n👤 Creating Master Superadmin User...')
  const masterEmail = 'master@erp.com'
  const masterPassword = 'MasterAdmin123!'
  const hashedMasterPassword = await bcrypt.hash(masterPassword, 10)

  const existingMaster = await prisma.user.findUnique({
    where: { email: masterEmail },
  })

  if (existingMaster) {
    console.log(`✅ Master Superadmin already exists: ${existingMaster.email}`)
    console.log(`   📧 Email: ${masterEmail}`)
    console.log(`   🔑 Password: ${masterPassword}`)
    console.log(`   🎖️  Role: superadmin-master`)
  } else {
    const master = await prisma.user.create({
      data: {
        email: masterEmail,
        password: hashedMasterPassword,
        firstName: 'Master',
        lastName: 'Admin',
        roleId: roles['superadmin-master'].id,
        isActive: true,
      },
    })
    console.log(`✅ Created Master Superadmin: ${master.email}`)
    console.log(`   📧 Email: ${masterEmail}`)
    console.log(`   🔑 Password: ${masterPassword}`)
    console.log(`   🎖️  Role: superadmin-master`)
    console.log(`   💡 Use this account to login and manage staff`)
  }

  // ==================== STAFF SUPERADMIN USER (NO COMPANY) ====================
  console.log('\n👤 Creating Staff Superadmin User (for testing)...')
  const staffEmail = 'staff@erp.com'
  const staffPassword = 'Staff123!'
  const hashedStaffPassword = await bcrypt.hash(staffPassword, 10)

  const existingStaff = await prisma.user.findUnique({
    where: { email: staffEmail },
  })

  if (existingStaff) {
    console.log(`✅ Staff Superadmin already exists: ${existingStaff.email}`)
    console.log(`   📧 Email: ${staffEmail}`)
    console.log(`   🔑 Password: ${staffPassword}`)
    console.log(`   ⭐ Role: superadmin-staff`)
  } else {
    const staff = await prisma.user.create({
      data: {
        email: staffEmail,
        password: hashedStaffPassword,
        firstName: 'Staff',
        lastName: 'Admin',
        roleId: roles['superadmin-staff'].id,
        isActive: true,
      },
    })
    console.log(`✅ Created Staff Superadmin: ${staff.email}`)
    console.log(`   📧 Email: ${staffEmail}`)
    console.log(`   🔑 Password: ${staffPassword}`)
    console.log(`   ⭐ Role: superadmin-staff`)
    console.log(`   💡 Use this account to test staff access restrictions`)
  }

  // ==================== DEMO COMPANY ====================
  console.log('\n🏢 Creating Demo Company...')
  const demoCompanyName = 'Demo Company'

  // Create subscription for demo company
  const professionalPlan = plans[1]; // Professional plan
  const startDate = new Date();
  const yearlyDiscount = professionalPlan.yearlyDiscount || 0;
  const discountType = professionalPlan.discountType || 'PERCENTAGE';
  
  // Calculate yearly price with discount
  let finalPrice = professionalPlan.yearlyPrice;
  if (yearlyDiscount > 0) {
    if (discountType === 'PERCENTAGE') {
      finalPrice = professionalPlan.yearlyPrice - (professionalPlan.yearlyPrice * yearlyDiscount / 100);
    } else {
      finalPrice = professionalPlan.yearlyPrice - yearlyDiscount;
    }
  }
  
  const demoSubscription = await prisma.subscription.create({
    data: {
      planId: professionalPlan.id,
      billingPeriod: 'YEARLY',
      price: finalPrice,
      status: 'ACTIVE',
      startDate: startDate,
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      lastPaymentAt: startDate,
      nextBillingAt: new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000),
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
  console.log('🎖️  Master Superadmin:')
  console.log(`  Email: ${masterEmail}`)
  console.log(`  Password: ${masterPassword}`)
  console.log('  Role: superadmin-master (Can manage staff)')
  console.log('\n⭐ Staff Superadmin:')
  console.log(`  Email: ${staffEmail}`)
  console.log(`  Password: ${staffPassword}`)
  console.log('  Role: superadmin-staff (Cannot manage staff)')
  console.log('\n👤 Demo Company Admin:')
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
