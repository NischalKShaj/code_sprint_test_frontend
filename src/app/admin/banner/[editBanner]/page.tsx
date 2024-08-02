import { GetStaticPaths, GetStaticProps } from "next";
import axios from "axios";
import EditBannerClientSide from "@/components/banner/EditBannerClientSide"; // Client-side component

interface Banner {
  id: string;
  banner_name: string;
  banner_description: string;
  bannerImage: string;
}

interface Props {
  banner: Banner | null;
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/banner/`
    );
    const banners: Banner[] = response.data;

    const paths = banners.map((banner) => ({
      params: { editBanner: banner.id },
    }));

    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error("Error fetching banner IDs:", error);
    return { paths: [], fallback: "blocking" };
  }
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { editBanner } = params as { editBanner: string };

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/banner/${editBanner}`
    );
    const banner: Banner = response.data;

    return {
      props: { banner },
      revalidate: 10, // Optional: Re-generate the page at most once every 10 seconds
    };
  } catch (error) {
    console.error("Error fetching banner data:", error);
    return { props: { banner: null } };
  }
};

const EditBannerPage = ({ banner }: Props) => {
  if (!banner) {
    return <div>No banner data available</div>;
  }

  return (
    <div>
      {/* Static content */}
      <EditBannerClientSide banner={banner} />
    </div>
  );
};

export default EditBannerPage;
