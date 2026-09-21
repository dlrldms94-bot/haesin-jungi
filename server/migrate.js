require("dotenv").config();
const { query, pool } = require("./db");

const SEED = [
  {
    title: "크롤러크레인 현장 작업",
    content: "중작업 현장에 투입된 크롤러크레인 운용 실적입니다.",
    image: "/img/main/1.jpg",
  },
  {
    title: "대형 장비 조립 및 설치",
    content: "현장 조건에 맞춘 장비 세팅과 안전 작업 지원 사례입니다.",
    image: "/img/main/2.jpg",
  },
  {
    title: "도심 건설 현장 지원",
    content: "협소 구간을 고려한 크레인 운용으로 공정을 지원했습니다.",
    image: "/img/main/3.jpg",
  },
  {
    title: "중량물 인양 작업",
    content: "고중량 자재 인양 및 설치를 안정적으로 수행한 실적입니다.",
    image: "/img/main/4.jpg",
  },
  {
    title: "플랜트 공사 지원",
    content: "플랜트 및 산업시설 공사에 투입된 장비 운용 사례입니다.",
    image: "/img/main/5.jpg",
  },
  {
    title: "교량·토목 현장 투입",
    content: "토목 현장의 핵심 공정에 장비를 투입해 일정을 맞춘 사례입니다.",
    image: "/img/main/6.jpg",
  },
  {
    title: "야간 작업 지원",
    content: "안전 절차를 준수한 야간 중작업 지원 실적입니다.",
    image: "/img/main/7.jpg",
  },
  {
    title: "전국 현장 대응",
    content: "전국 영업망을 활용한 신속 대응 및 장비 공급 사례입니다.",
    image: "/img/main/8.jpg",
  },
];

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  await query(`
    CREATE TABLE IF NOT EXISTS works (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await query("SELECT COUNT(*)::int AS count FROM works");
  if (rows[0].count === 0) {
    for (const item of SEED) {
      await query(
        "INSERT INTO works (title, content, image) VALUES ($1, $2, $3)",
        [item.title, item.content, item.image]
      );
    }
    console.log(`[db] seeded ${SEED.length} works posts`);
  } else {
    console.log(`[db] works already has ${rows[0].count} rows`);
  }
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log("[db] migrate ok");
      return pool.end();
    })
    .catch(async (error) => {
      console.error("[db] migrate failed", error);
      await pool.end();
      process.exit(1);
    });
}

module.exports = { migrate, SEED };
