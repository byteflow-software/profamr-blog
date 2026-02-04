import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

async function getTickerHeadlines() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 8,
    select: { title: true, slug: true },
  });
  return posts;
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tickerHeadlines = await getTickerHeadlines();

  return (
    <>
      <Header tickerHeadlines={tickerHeadlines} />
      <main>{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
