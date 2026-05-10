import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

      // 👨‍🏫 Mentors
      await prisma.user.createMany({
            data: [
                  {
                        name: "Kavya",
                        email: "kavya@mockmentor.com",
                        password: "123456",
                        role: "MENTOR",
                  },
                  {
                        name: "Akshay",
                        email: "akshay@mockmentor.com",
                        password: "123456",
                        role: "MENTOR",
                  },
                  {
                        name: "Ranjith",
                        email: "ranjith@mockmentor.com",
                        password: "123456",
                        role: "MENTOR",
                  },
            ],
            skipDuplicates: true,
      });

      // 👨‍🎓 Students
      await prisma.user.createMany({
            data: [
                  {
                        name: "Srikanth",
                        email: "srikanth@mockmentor.com",
                        password: "123456",
                        role: "STUDENT",
                  },
                  {
                        name: "Rishi",
                        email: "rishi@mockmentor.com",
                        password: "123456",
                        role: "STUDENT",
                  },
                  {
                        name: "Kalyani",
                        email: "kalyani@mockmentor.com",
                        password: "123456",
                        role: "STUDENT",
                  },
            ],
            skipDuplicates: true,
      });

      console.log("✅ Seed data inserted");
}

main()
      .catch((e) => {
            console.error(e);
      })
      .finally(async () => {
            await prisma.$disconnect();
      });