import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const projectName = 'My First Project';
  console.log(`Checking if project ${projectName} already exists`);

  const existingProject = await prisma.project.findFirst({
    where: { name: projectName },
  });

  if (existingProject) {
    console.log(`Project ${projectName} already exists. Seed script finished`);
    console.log(`API Key: ${existingProject.apiKey}`);
    return;
  }

  const apiKey = randomBytes(24).toString('hex');
  const newProject = await prisma.project.create({
    data: {
      name: projectName,
      apiKey: apiKey,
    },
  });

  console.log(
    `Project ${projectName} created succesfully, your API Key: ${newProject.apiKey}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
