import SearchPage from "@/pages/search-page";
export default function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <SearchPage {...props} />;
}
