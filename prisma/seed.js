const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEMO_PASSWORD = "123456";

const STUDENT = { name: "Yashwanth", email: "yashwanth.student@example.com" };
const MENTOR = { name: "Akshay", email: "akshay.mentor@example.com" };

const WEEKDAYS = [1, 2, 3, 4, 5];
const START_HOUR = 9;
const END_HOUR = 17;

const PAST_DEMO_TOPIC = "Demo: JavaScript basics";

const COMPLETED_DEMO = {
  topic: "Demo: React Interview",
  rating: 4,
  feedback:
    "Good understanding of React basics and clear answers. Practise explaining your decisions a bit more before you start coding.",
  strengths: "Explained useState and useEffect well, and wrote clean components.",
  improvements: "Talk about trade-offs, for example when to lift state up or use a context.",
};

async function upsertUser({ name, email }, role, password) {
  return prisma.user.upsert({
    where: { email },
    update: { name, role, password },
    create: { name, email, role, password },
  });
}

async function main() {
  const password = bcrypt.hashSync(DEMO_PASSWORD, 10);

  const student = await upsertUser(STUDENT, "STUDENT", password);
  const mentor = await upsertUser(MENTOR, "MENTOR", password);

  for (const dayOfWeek of WEEKDAYS) {
    await prisma.mentorAvailability.upsert({
      where: { mentorId_dayOfWeek: { mentorId: mentor.id, dayOfWeek } },
      update: { startHour: START_HOUR, endHour: END_HOUR },
      create: { mentorId: mentor.id, dayOfWeek, startHour: START_HOUR, endHour: END_HOUR },
    });
  }

  const pastDemo = await prisma.interview.findFirst({
    where: { userId: student.id, topic: PAST_DEMO_TOPIC, status: "ACCEPTED" },
  });

  if (!pastDemo) {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(8, 0, 0, 0);

    await prisma.interview.create({
      data: {
        topic: PAST_DEMO_TOPIC,
        date: yesterday,
        status: "ACCEPTED",
        userId: student.id,
        mentorId: mentor.id,
      },
    });
  }

  const completedDemo = await prisma.interview.findFirst({
    where: { userId: student.id, topic: COMPLETED_DEMO.topic, status: "COMPLETED" },
  });

  if (!completedDemo) {
    const lastWeek = new Date();
    lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);
    lastWeek.setUTCHours(9, 0, 0, 0);

    await prisma.interview.create({
      data: {
        ...COMPLETED_DEMO,
        date: lastWeek,
        status: "COMPLETED",
        completedAt: lastWeek,
        userId: student.id,
        mentorId: mentor.id,
      },
    });
  }

  console.log(`Seeded demo accounts: ${STUDENT.email}, ${MENTOR.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
